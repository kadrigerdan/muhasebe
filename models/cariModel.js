import { query } from '@/database/db';

export async function tumCariler({ tip, arama } = {}) {
    const sartlar = ['1=1'];
    const params = [];
    if (tip) {
        sartlar.push("(tip = ? OR tip = 'her_ikisi')");
        params.push(tip);
    }
    if (arama) {
        sartlar.push('unvan LIKE ?');
        params.push(`%${arama}%`);
    }
    return await query(
        `SELECT id, unvan, tip, telefon, adres, vergi_no, yetkili, email, aktif, created_at
       FROM cariler
      WHERE ${sartlar.join(' AND ')}
      ORDER BY unvan`,
        params
    );
}

export async function tedarikciListesi() {
    return await query(
        `SELECT id, unvan FROM cariler
      WHERE tip IN ('tedarikci','her_ikisi') AND aktif = 1
      ORDER BY unvan`
    );
}

export async function musteriListesi() {
    return await query(
        `SELECT id, unvan,telefon,adres FROM cariler
      WHERE tip IN ('musteri','her_ikisi') AND aktif = 1
      ORDER BY unvan`
    );
}

export async function cariGetir(id) {
    const rows = await query('SELECT * FROM cariler WHERE id = ?', [id]);
    return rows[0] ?? null;
}

export async function cariOlustur(veri) {
    const res = await query(
        `INSERT INTO cariler
       (unvan, tip, telefon, adres, vergi_no, vergi_dairesi, yetkili, email, aktif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            veri.unvan, veri.tip ?? 'her_ikisi',
            veri.telefon ?? null, veri.adres ?? null,
            veri.vergi_no ?? null, veri.vergi_dairesi ?? null,
            veri.yetkili ?? null, veri.email ?? null,
            veri.aktif ?? 1,
        ]
    );
    return Number(res.insertId);
}

export async function cariGuncelleDB(id, veri) {
    const res = await query(
        `UPDATE cariler
        SET unvan = ?, tip = ?, telefon = ?, adres = ?,
            vergi_no = ?, vergi_dairesi = ?, yetkili = ?, email = ?, aktif = ?
      WHERE id = ?`,
        [
            veri.unvan, veri.tip, veri.telefon ?? null, veri.adres ?? null,
            veri.vergi_no ?? null, veri.vergi_dairesi ?? null,
            veri.yetkili ?? null, veri.email ?? null,
            veri.aktif ?? 1, id,
        ]
    );
    return Number(res.affectedRows);
}

export async function cariSilDB(id) {
    const res = await query('DELETE FROM cariler WHERE id = ?', [id]);
    return Number(res.affectedRows);
}

// -------- CARİ EKSTRESİ --------
export async function cariEkstre(cariId) {
    const hareketler = await query(
        `SELECT 'alis' AS tip, f.id AS fatura_id, f.tarih,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS tutar,
            0 AS borc,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS alacak
       FROM alis_faturalar f
       LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
      WHERE f.cari_id = ?
      GROUP BY f.id, f.tarih

     UNION ALL

     SELECT 'alis_odeme' AS tip, fo.id AS fatura_id, fo.tarih,
            fo.tutar AS tutar,
            fo.tutar AS borc,
            0 AS alacak
       FROM fatura_odemeleri fo
       JOIN alis_faturalar f ON f.id = fo.fatura_id AND fo.fatura_tipi = 'alis'
      WHERE f.cari_id = ?

     UNION ALL

     SELECT 'satis' AS tip, f.id AS fatura_id, f.tarih,
            COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS tutar,
            COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS borc,
            0 AS alacak
       FROM satis_faturalar f
       LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
      WHERE f.cari_id = ?
      GROUP BY f.id, f.tarih

     UNION ALL

     SELECT 'satis_tahsilat' AS tip, fo.id AS fatura_id, fo.tarih,
            fo.tutar AS tutar,
            0 AS borc,
            fo.tutar AS alacak
       FROM fatura_odemeleri fo
       JOIN satis_faturalar f ON f.id = fo.fatura_id AND fo.fatura_tipi = 'satis'
      WHERE f.cari_id = ?

      ORDER BY tarih, tip, fatura_id`,
        [cariId, cariId, cariId, cariId]
    );

    let toplamBorc = 0;
    let toplamAlacak = 0;
    for (const h of hareketler) {
        toplamBorc += Number(h.borc);
        toplamAlacak += Number(h.alacak);
        h.bakiye = toplamBorc - toplamAlacak;
    }

    return {
        hareketler,
        toplamBorc,
        toplamAlacak,
        bakiye: toplamBorc - toplamAlacak,
    };
}

// -------- CARİ BAKİYE ÖZETİ --------
export async function cariBakiyeListesi() {
    return await query(
        `SELECT
       c.id, c.unvan, c.tip, c.telefon,
       COALESCE(s.fatura_toplam, 0) - COALESCE(s.tahsilat, 0) AS toplam_borc,
       COALESCE(a.fatura_toplam, 0) - COALESCE(a.odeme, 0)    AS toplam_alacak,
       (COALESCE(s.fatura_toplam, 0) - COALESCE(s.tahsilat, 0))
       - (COALESCE(a.fatura_toplam, 0) - COALESCE(a.odeme, 0)) AS bakiye
     FROM cariler c
     LEFT JOIN (
       SELECT f.cari_id,
              SUM(d.adet * d.birim_fiyat) AS fatura_toplam,
              (SELECT COALESCE(SUM(fo.tutar), 0)
                 FROM fatura_odemeleri fo
                WHERE fo.fatura_tipi = 'satis'
                  AND fo.fatura_id IN (SELECT id FROM satis_faturalar WHERE cari_id = f.cari_id)
              ) AS tahsilat
         FROM satis_faturalar f
         JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
        GROUP BY f.cari_id
     ) s ON s.cari_id = c.id
     LEFT JOIN (
       SELECT f.cari_id,
              SUM(d.miktar * d.birim_fiyat) AS fatura_toplam,
              (SELECT COALESCE(SUM(fo.tutar), 0)
                 FROM fatura_odemeleri fo
                WHERE fo.fatura_tipi = 'alis'
                  AND fo.fatura_id IN (SELECT id FROM alis_faturalar WHERE cari_id = f.cari_id)
              ) AS odeme
         FROM alis_faturalar f
         JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
        GROUP BY f.cari_id
     ) a ON a.cari_id = c.id
     WHERE c.aktif = 1
     ORDER BY c.unvan`
    );
}