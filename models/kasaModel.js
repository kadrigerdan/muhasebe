import { query, getConnection } from '@/database/db';

// -------- KASA HESAPLARI --------
export async function tumKasaHesaplari() {
    return await query(
        `SELECT
       k.id, k.ad, k.tip, k.banka_adi, k.iban, k.acilis_bakiye, k.aktif,
       COALESCE(SUM(CASE WHEN h.tip = 'giris' THEN h.tutar ELSE 0 END), 0) AS toplam_giris,
       COALESCE(SUM(CASE WHEN h.tip = 'cikis'  THEN h.tutar ELSE 0 END), 0) AS toplam_cikis,
       k.acilis_bakiye
         + COALESCE(SUM(CASE WHEN h.tip = 'giris' THEN h.tutar ELSE -h.tutar END), 0) AS bakiye
     FROM kasa_hesaplari k
     LEFT JOIN kasa_hareketleri h ON h.kasa_id = k.id
     GROUP BY k.id, k.ad, k.tip, k.banka_adi, k.iban, k.acilis_bakiye, k.aktif
     ORDER BY k.tip, k.ad`
    );
}

export async function aktifKasaHesaplari() {
    return await query(
        `SELECT
       k.id, k.ad, k.tip,
       k.acilis_bakiye
         + COALESCE(SUM(CASE WHEN h.tip = 'giris' THEN h.tutar ELSE -h.tutar END), 0) AS bakiye
     FROM kasa_hesaplari k
     LEFT JOIN kasa_hareketleri h ON h.kasa_id = k.id
     WHERE k.aktif = 1
     GROUP BY k.id, k.ad, k.tip, k.acilis_bakiye
     ORDER BY k.tip, k.ad`
    );
}

export async function kasaGetir(id) {
    const rows = await query(
        `SELECT
       k.*,
       k.acilis_bakiye
         + COALESCE((SELECT SUM(CASE WHEN tip = 'giris' THEN tutar ELSE -tutar END)
                       FROM kasa_hareketleri WHERE kasa_id = k.id), 0) AS bakiye
     FROM kasa_hesaplari k
     WHERE k.id = ?`,
        [id]
    );
    return rows[0] ?? null;
}

export async function kasaOlustur(veri) {
    const res = await query(
        `INSERT INTO kasa_hesaplari (ad, tip, banka_adi, iban, acilis_bakiye, aktif)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            veri.ad, veri.tip, veri.banka_adi ?? null,
            veri.iban ?? null, veri.acilis_bakiye ?? 0, veri.aktif ?? 1,
        ]
    );
    return Number(res.insertId);
}

export async function kasaGuncelleDB(id, veri) {
    const res = await query(
        `UPDATE kasa_hesaplari
        SET ad = ?, tip = ?, banka_adi = ?, iban = ?, acilis_bakiye = ?, aktif = ?
      WHERE id = ?`,
        [
            veri.ad, veri.tip, veri.banka_adi ?? null,
            veri.iban ?? null, veri.acilis_bakiye ?? 0, veri.aktif ?? 1, id,
        ]
    );
    return Number(res.affectedRows);
}

export async function kasaSilDB(id) {
    const res = await query('DELETE FROM kasa_hesaplari WHERE id = ?', [id]);
    return Number(res.affectedRows);
}

// -------- HAREKETLER --------
export async function kasaHareketleri(kasaId, limit = 200) {
    return await query(
        `SELECT id, tip, tutar, tarih, aciklama, kaynak_tipi, kaynak_id, created_at
       FROM kasa_hareketleri
      WHERE kasa_id = ?
      ORDER BY tarih DESC, id DESC
      LIMIT ?`,
        [kasaId, limit]
    );
}

export async function tumKasaHareketleri({ kasaId, tip, baslangic, bitis } = {}) {
    const sartlar = ['1=1'];
    const params = [];

    if (kasaId) {
        sartlar.push('h.kasa_id = ?');
        params.push(kasaId);
    }
    if (tip) {
        sartlar.push('h.tip = ?');
        params.push(tip);
    }
    if (baslangic) {
        sartlar.push('h.tarih >= ?');
        params.push(baslangic);
    }
    if (bitis) {
        sartlar.push('h.tarih <= ?');
        params.push(bitis);
    }

    return await query(
        `SELECT h.*, k.ad AS kasa_ad
       FROM kasa_hareketleri h
       JOIN kasa_hesaplari k ON k.id = h.kasa_id
      WHERE ${sartlar.join(' AND ')}
      ORDER BY h.tarih DESC, h.id DESC
      LIMIT 500`,
        params
    );
}

// -------- HAREKET EKLE (transaction'sız, çağıran taraf transaction açar) --------
export async function hareketEkle(conn, veri) {
    const res = await conn.query(
        `INSERT INTO kasa_hareketleri
       (kasa_id, tip, tutar, tarih, aciklama, kaynak_tipi, kaynak_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            veri.kasa_id, veri.tip, veri.tutar, veri.tarih,
            veri.aciklama ?? null, veri.kaynak_tipi ?? 'diger',
            veri.kaynak_id ?? null,
        ]
    );
    return Number(res.insertId);
}

// -------- ÖZET --------
export async function kasaOzet() {
    const rows = await query(
        `SELECT
       (SELECT COUNT(*) FROM kasa_hesaplari WHERE aktif = 1) AS aktif_kasa_sayisi,
       COALESCE((
         SELECT SUM(k.acilis_bakiye) + COALESCE(SUM(CASE WHEN h.tip = 'giris' THEN h.tutar ELSE -h.tutar END), 0)
           FROM kasa_hesaplari k
           LEFT JOIN kasa_hareketleri h ON h.kasa_id = k.id
          WHERE k.aktif = 1
       ), 0) AS toplam_bakiye`
    );
    return rows[0];
}