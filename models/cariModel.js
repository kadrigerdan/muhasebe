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
        `SELECT
            CASE WHEN f.fatura_tipi = 'iade' THEN 'alis_iade' ELSE 'alis' END AS tip,
            f.id AS fatura_id, f.tarih,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS tutar,
            CASE WHEN f.fatura_tipi = 'iade' THEN COALESCE(SUM(d.miktar * d.birim_fiyat), 0) ELSE 0 END AS borc,
            CASE WHEN f.fatura_tipi = 'iade' THEN 0 ELSE COALESCE(SUM(d.miktar * d.birim_fiyat), 0) END AS alacak
          FROM alis_faturalar f
          LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
         WHERE f.cari_id = ? AND f.arsivlendi = 0
         GROUP BY f.id, f.tarih, f.fatura_tipi

        UNION ALL

        SELECT
            CASE WHEN af.fatura_tipi = 'iade' THEN 'alis_iade_odeme' ELSE 'alis_odeme' END AS tip,
            fo.id AS fatura_id, fo.tarih,
            fo.tutar AS tutar,
            CASE WHEN af.fatura_tipi = 'iade' AND fo.kasadan_dus = 1 THEN fo.tutar ELSE 0 END AS borc,
            CASE WHEN af.fatura_tipi = 'iade' THEN fo.tutar ELSE 0 END AS alacak
          FROM fatura_odemeleri fo
          JOIN alis_faturalar af ON af.id = fo.fatura_id
         WHERE fo.fatura_tipi = 'alis'
  AND af.cari_id = ?
  AND af.arsivlendi = 0
  AND (af.fatura_tipi = 'normal' OR fo.kasadan_dus = 1)

        UNION ALL

        SELECT
            CASE WHEN f.fatura_tipi = 'iade' THEN 'satis_iade' ELSE 'satis' END AS tip,
            f.id AS fatura_id, f.tarih,
            COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS tutar,
            CASE WHEN f.fatura_tipi = 'iade' THEN 0 ELSE COALESCE(SUM(d.adet * d.birim_fiyat), 0) END AS borc,
            CASE WHEN f.fatura_tipi = 'iade' THEN COALESCE(SUM(d.adet * d.birim_fiyat), 0) ELSE 0 END AS alacak
          FROM satis_faturalar f
          LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
         WHERE f.cari_id = ? AND f.arsivlendi = 0
         GROUP BY f.id, f.tarih, f.fatura_tipi

        UNION ALL

        SELECT
            CASE WHEN sf.fatura_tipi = 'iade' THEN 'satis_iade_odeme' ELSE 'satis_tahsilat' END AS tip,
            fo.id AS fatura_id, fo.tarih,
            fo.tutar AS tutar,
            CASE WHEN sf.fatura_tipi = 'iade' AND fo.kasadan_dus = 1 THEN fo.tutar ELSE 0 END AS borc,
            CASE WHEN sf.fatura_tipi = 'iade' THEN 0 ELSE fo.tutar END AS alacak
        FROM fatura_odemeleri fo
        JOIN satis_faturalar sf ON sf.id = fo.fatura_id
        WHERE fo.fatura_tipi = 'satis'
        AND sf.cari_id = ?
        AND sf.arsivlendi = 0
        AND (sf.fatura_tipi = 'normal' OR fo.kasadan_dus = 1)

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
           c.id, c.unvan, c.tip, c.telefon, c.adres,
           b.satis_net, b.alis_net,
           b.bakiye,
           GREATEST(0, b.bakiye) AS toplam_borc,
           GREATEST(0, -b.bakiye) AS toplam_alacak
         FROM cariler c
         LEFT JOIN (
           SELECT 
             x.id AS cari_id,
             (COALESCE(s.satis_toplam,0) - COALESCE(s.tahsilat,0) - COALESCE(s.iade,0) + COALESCE(s.para_iade,0)) AS satis_net,
             (COALESCE(a.alis_toplam,0) - COALESCE(a.odeme,0) - COALESCE(a.iade,0) + COALESCE(a.para_iade,0)) AS alis_net,
             (COALESCE(s.satis_toplam,0) - COALESCE(s.tahsilat,0) - COALESCE(s.iade,0) + COALESCE(s.para_iade,0))
             - (COALESCE(a.alis_toplam,0) - COALESCE(a.odeme,0) - COALESCE(a.iade,0) + COALESCE(a.para_iade,0)) AS bakiye
           FROM cariler x
           LEFT JOIN (
             SELECT f.cari_id,
                    SUM(CASE WHEN f.fatura_tipi = 'normal' THEN (d.adet * d.birim_fiyat) ELSE 0 END) AS satis_toplam,
                    SUM(CASE WHEN f.fatura_tipi = 'iade' THEN (d.adet * d.birim_fiyat) ELSE 0 END) AS iade,
                    (SELECT COALESCE(SUM(fo.tutar), 0)
                       FROM fatura_odemeleri fo
                       JOIN satis_faturalar sf ON sf.id = fo.fatura_id
                      WHERE fo.fatura_tipi = 'satis'
                        AND sf.fatura_tipi = 'normal'
                        AND sf.arsivlendi = 0
                        AND sf.cari_id = f.cari_id
                    ) AS tahsilat,
                    (SELECT COALESCE(SUM(fo.tutar), 0)
                       FROM fatura_odemeleri fo
                       JOIN satis_faturalar sf ON sf.id = fo.fatura_id
                      WHERE fo.fatura_tipi = 'satis'
                        AND sf.fatura_tipi = 'iade'
                        AND sf.arsivlendi = 0
                        AND fo.kasadan_dus = 1
                        AND sf.cari_id = f.cari_id
                    ) AS para_iade
               FROM satis_faturalar f
               JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
              WHERE f.arsivlendi = 0
              GROUP BY f.cari_id
           ) s ON s.cari_id = x.id
           LEFT JOIN (
             SELECT f.cari_id,
                    SUM(CASE WHEN f.fatura_tipi = 'normal' THEN (d.miktar * d.birim_fiyat) ELSE 0 END) AS alis_toplam,
                    SUM(CASE WHEN f.fatura_tipi = 'iade' THEN (d.miktar * d.birim_fiyat) ELSE 0 END) AS iade,
                    (SELECT COALESCE(SUM(fo.tutar), 0)
                       FROM fatura_odemeleri fo
                       JOIN alis_faturalar af ON af.id = fo.fatura_id
                      WHERE fo.fatura_tipi = 'alis'
                        AND af.fatura_tipi = 'normal'
                        AND af.arsivlendi = 0
                        AND af.cari_id = f.cari_id
                    ) AS odeme,
                    (SELECT COALESCE(SUM(fo.tutar), 0)
                       FROM fatura_odemeleri fo
                       JOIN alis_faturalar af ON af.id = fo.fatura_id
                      WHERE fo.fatura_tipi = 'alis'
                        AND af.fatura_tipi = 'iade'
                        AND af.arsivlendi = 0
                        AND fo.kasadan_dus = 1
                        AND af.cari_id = f.cari_id
                    ) AS para_iade
               FROM alis_faturalar f
               JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
              WHERE f.arsivlendi = 0
              GROUP BY f.cari_id
           ) a ON a.cari_id = x.id
         ) b ON b.cari_id = c.id`
    );
}