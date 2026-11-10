import { query } from '@/database/db';

export async function tumUrunler({ arama, durum } = {}) {
  const sartlar = ['1=1'];
  const params = [];

  if (arama) {
    sartlar.push('urun_adi LIKE ?');
    params.push(`%${arama}%`);
  }
  if (durum !== undefined) {
    sartlar.push('durum = ?');
    params.push(durum ? 1 : 0);
  }
  return await query(
    `SELECT id, urun_adi, tip, kritik_seviye,
            varsayilan_alis_fiyati, varsayilan_satis_fiyati,
            durum, stok, created_at
       FROM urunler
      WHERE ${sartlar.join(' AND ')}
      ORDER BY tip, urun_adi`,
    params
  );
}

export async function urunGetir(id) {
  const rows = await query('SELECT * FROM urunler WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function urunOlustur(veri) {
  const res = await query(
    `INSERT INTO urunler 
       (urun_adi, tip, kritik_seviye, varsayilan_alis_fiyati, varsayilan_satis_fiyati, durum, stok)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      veri.urun_adi, veri.tip ?? 'hammadde',
      veri.kritik_seviye ?? null,
      veri.varsayilan_alis_fiyati ?? 0,
      veri.varsayilan_satis_fiyati ?? 0,
      veri.durum ?? 1,
      veri.stok ?? 0,
    ]
  );
  const urunId = Number(res.insertId);

  // YENİ: Başlangıç stoğu varsa varsayılan depoya (1 = Kasap Deposu) ekle
  if (veri.stok && Number(veri.stok) > 0) {
    await query(
      `INSERT INTO urun_stok (urun_id, depo_id, stok) 
             VALUES (?, 1, ?) 
             ON DUPLICATE KEY UPDATE stok = stok + VALUES(stok)`,
      [urunId, veri.stok]
    );
  }

  return urunId;
}

export async function urunGuncelleDB(id, veri) {
  // Mevcut stoğu al
  const eski = await query('SELECT stok FROM urunler WHERE id = ?', [id]);
  const eskiStok = Number(eski[0]?.stok ?? 0);

  const res = await query(
    `UPDATE urunler
        SET urun_adi = ?, tip = ?, kritik_seviye = ?, 
            varsayilan_alis_fiyati = ?, varsayilan_satis_fiyati = ?, 
            durum = ?, stok = ?
      WHERE id = ?`,
    [
      veri.urun_adi, veri.tip, veri.kritik_seviye ?? null,
      veri.varsayilan_alis_fiyati ?? 0, veri.varsayilan_satis_fiyati ?? 0,
      veri.durum ?? 1, veri.stok ?? 0, id,
    ]
  );

  // YENİ: Stok değiştiyse farkı depoya yansıt (1 = Kasap Deposu)
  const yeniStok = Number(veri.stok ?? 0);
  const fark = yeniStok - eskiStok;
  if (fark !== 0) {
    await query(
      `INSERT INTO urun_stok (urun_id, depo_id, stok) 
             VALUES (?, 1, ?) 
             ON DUPLICATE KEY UPDATE stok = stok + VALUES(stok)`,
      [id, fark]
    );
  }

  return Number(res.affectedRows);
}

export async function urunSilDB(id) {
  const res = await query('DELETE FROM urunler WHERE id = ?', [id]);
  return Number(res.affectedRows);
}

// Stok değeri hesabı için ek
export async function urunOzet() {
  const rows = await query(`
        SELECT
            (SELECT COUNT(*) FROM urunler) AS toplam_urun,
            (SELECT COUNT(*) FROM urunler WHERE durum = 1) AS aktif_urun,
            COALESCE((
                SELECT SUM(us.stok * u.varsayilan_alis_fiyati)
                  FROM urun_stok us
                  JOIN urunler u ON u.id = us.urun_id
                 WHERE u.durum = 1
            ), 0) AS stok_degeri_alis,
            COALESCE((
                SELECT SUM(us.stok * u.varsayilan_satis_fiyati)
                  FROM urun_stok us
                  JOIN urunler u ON u.id = us.urun_id
                 WHERE u.durum = 1
            ), 0) AS stok_degeri_satis
    `);
  return rows[0];
}