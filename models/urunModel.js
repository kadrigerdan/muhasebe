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
    `SELECT id, urun_adi, kritik_seviye,
            varsayilan_alis_fiyati, varsayilan_satis_fiyati,
            durum, stok, created_at
       FROM urunler
      WHERE ${sartlar.join(' AND ')}
      ORDER BY urun_adi`,
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
       (urun_adi, kritik_seviye, varsayilan_alis_fiyati, varsayilan_satis_fiyati, durum, stok)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      veri.urun_adi,
      veri.kritik_seviye ?? 10,
      veri.varsayilan_alis_fiyati ?? 0,
      veri.varsayilan_satis_fiyati ?? 0,
      veri.durum ?? 1,
      veri.stok ?? 0,
    ]
  );
  return Number(res.insertId);
}

export async function urunGuncelleDB(id, veri) {
  const res = await query(
    `UPDATE urunler
        SET urun_adi = ?,
            kritik_seviye = ?,
            varsayilan_alis_fiyati = ?,
            varsayilan_satis_fiyati = ?,
            durum = ?
      WHERE id = ?`,
    [
      veri.urun_adi,
      veri.kritik_seviye ?? 10,
      veri.varsayilan_alis_fiyati ?? 0,
      veri.varsayilan_satis_fiyati ?? 0,
      veri.durum ?? 1,
      id,
    ]
  );
  return Number(res.affectedRows);
}

export async function urunSilDB(id) {
  const res = await query('DELETE FROM urunler WHERE id = ?', [id]);
  return Number(res.affectedRows);
}

// Stok değeri hesabı için ek
export async function urunOzet() {
  const rows = await query(
    `SELECT
       COUNT(*) AS toplam_urun,
       SUM(CASE WHEN durum = 1 THEN 1 ELSE 0 END) AS aktif_urun,
       COALESCE(SUM(CASE WHEN durum = 1 THEN stok * varsayilan_alis_fiyati ELSE 0 END), 0) AS stok_degeri_alis,
       COALESCE(SUM(CASE WHEN durum = 1 THEN stok * varsayilan_satis_fiyati ELSE 0 END), 0) AS stok_degeri_satis
     FROM urunler`
  );
  return rows[0];
}