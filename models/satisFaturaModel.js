import { query, getConnection } from '@/database/db';

export async function tumSatisFaturalar({ gorunum = 'aktif' } = {}) {
    const where =
        gorunum === 'arsiv' ? 'WHERE f.arsivlendi = 1'
            : gorunum === 'iade' ? "WHERE f.fatura_tipi = 'iade' AND f.arsivlendi = 0"
                : gorunum === 'aktif' ? `WHERE f.fatura_tipi = 'normal' AND f.arsivlendi = 0
            AND (
              SELECT COALESCE(SUM(iad.adet), 0)
                FROM satis_fatura_detaylari iad
                JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
               WHERE iadf.kaynak_fatura_id = f.id
                 AND iadf.fatura_tipi = 'iade'
                 AND iadf.arsivlendi = 0
            ) < (
              SELECT COALESCE(SUM(d2.adet), 0)
                FROM satis_fatura_detaylari d2
               WHERE d2.fatura_id = f.id
            ) - 0.01`
                    : gorunum === 'iade_kesilmis' ? `WHERE f.fatura_tipi = 'normal' AND f.arsivlendi = 0
    AND (SELECT COUNT(*) FROM satis_faturalar iad
           WHERE iad.kaynak_fatura_id = f.id
             AND iad.fatura_tipi = 'iade'
             AND iad.arsivlendi = 0) > 0`
                        : '';
    return await query(`
        SELECT f.id, f.tarih, f.odenen_tutar, f.durum, f.arsivlendi,
               f.fatura_tipi, f.kaynak_fatura_id,
               (SELECT COUNT(*) FROM satis_faturalar iad
                  WHERE iad.kaynak_fatura_id = f.id
                    AND iad.fatura_tipi = 'iade'
                    AND COALESCE(iad.arsivlendi, 0) = 0) AS iade_sayisi,
                    (SELECT COALESCE(SUM(iad.adet * iad.birim_fiyat), 0)
   FROM satis_fatura_detaylari iad
   JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
  WHERE iadf.kaynak_fatura_id = f.id
    AND iadf.fatura_tipi = 'iade'
    AND iadf.arsivlendi = 0) AS iade_toplam,
                    CASE WHEN f.fatura_tipi = 'normal' 
  AND (SELECT COALESCE(SUM(iad.adet), 0)
         FROM satis_fatura_detaylari iad
         JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
        WHERE iadf.kaynak_fatura_id = f.id 
          AND iadf.fatura_tipi = 'iade' 
          AND iadf.arsivlendi = 0
      ) >= (
        SELECT COALESCE(SUM(d2.adet), 0)
          FROM satis_fatura_detaylari d2 
         WHERE d2.fatura_id = f.id
      ) - 0.01
  THEN 1 ELSE 0 END AS tamamen_iade,
               c.unvan AS cari_unvan,
               COUNT(d.id) AS kalem_sayisi,
               COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam
          FROM satis_faturalar f
          JOIN cariler c ON c.id = f.cari_id
          LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
          ${where}
         GROUP BY f.id, f.tarih, f.odenen_tutar, f.durum, f.arsivlendi,
                  f.fatura_tipi, f.kaynak_fatura_id, c.unvan
         ORDER BY f.tarih DESC, f.id DESC
    `);
}

export async function satisFaturaGetir(id) {
    const rows = await query(
        `SELECT f.*, c.unvan AS cari_unvan
           FROM satis_faturalar f
           JOIN cariler c ON c.id = f.cari_id
          WHERE f.id = ?`,
        [id]
    );
    if (!rows.length) return null;

    const fatura = rows[0];
    fatura.kalemler = await query(
        `SELECT d.*, u.urun_adi, u.stok
           FROM satis_fatura_detaylari d
           JOIN urunler u ON u.id = d.urun_id
          WHERE d.fatura_id = ?`,
        [id]
    );

    fatura.toplam = fatura.kalemler.reduce(
        (s, k) => s + Number(k.adet) * Number(k.birim_fiyat),
        0
    );

    // YENİ: Bu faturaya kesilen iadelerin toplam tutarı
    const iadeRows = await query(
        `SELECT COALESCE(SUM(iad.adet * iad.birim_fiyat), 0) AS iade_toplam
           FROM satis_fatura_detaylari iad
           JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
          WHERE iadf.kaynak_fatura_id = ?
            AND iadf.fatura_tipi = 'iade'
            AND iadf.arsivlendi = 0`,
        [id]
    );
    fatura.iade_toplam = Number(iadeRows[0]?.iade_toplam ?? 0);

    return fatura;
}

export async function satisFaturaOlustur({ cari_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Stok kontrolü (kilitli oku)
        for (const k of kalemler) {
            const urunRows = await conn.query(
                'SELECT id, urun_adi, stok FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
            const urun = urunRows[0];
            if (!urun) throw new Error(`Ürün bulunamadı: ${k.urun_id}`);
            if (Number(urun.stok) < Number(k.adet)) {
                throw new Error(
                    `Yetersiz stok: ${urun.urun_adi} (mevcut: ${urun.stok}, istenen: ${k.adet})`
                );
            }
        }

        const basRes = await conn.query(
            'INSERT INTO satis_faturalar (cari_id, tarih) VALUES (?, ?)',
            [cari_id, tarih]
        );
        const faturaId = Number(basRes.insertId);

        for (const k of kalemler) {
            await conn.query(
                `INSERT INTO satis_fatura_detaylari
           (fatura_id, urun_id, adet, birim_fiyat)
         VALUES (?, ?, ?, ?)`,
                [faturaId, k.urun_id, k.adet, k.birim_fiyat]
            );

            await conn.query(
                `INSERT INTO stok_hareketleri
           (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
         VALUES (?, 'cikis', ?, ?, 'satis_fatura', ?, ?)`,
                [k.urun_id, k.adet, `Satış faturası #${faturaId}`, faturaId, tarih]
            );

            await conn.query(
                `UPDATE urunler
            SET stok = stok - ?, varsayilan_satis_fiyati = ?
          WHERE id = ?`,
                [k.adet, k.birim_fiyat, k.urun_id]
            );
        }

        await conn.commit();
        return faturaId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function satisMaliOzet({ gorunum = 'aktif' } = {}) {
    const where =
        gorunum === 'arsiv' ? 'WHERE COALESCE(f.arsivlendi, 0) = 1'
            : gorunum === 'iade' ? "WHERE f.fatura_tipi = 'iade' AND COALESCE(f.arsivlendi, 0) = 0"
                : gorunum === 'aktif' ? `WHERE f.fatura_tipi = 'normal' AND COALESCE(f.arsivlendi, 0) = 0
            AND (
              SELECT COALESCE(SUM(iad.miktar), 0)
                FROM alis_fatura_detaylari iad
                JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
               WHERE iadf.kaynak_fatura_id = f.id
                 AND iadf.fatura_tipi = 'iade'
                 AND COALESCE(iadf.arsivlendi, 0) = 0
            ) < (
              SELECT COALESCE(SUM(d2.miktar), 0)
                FROM alis_fatura_detaylari d2
               WHERE d2.fatura_id = f.id
            ) - 0.01`
                    : '';
    const rows = await query(`  
        SELECT
            COUNT(DISTINCT CASE WHEN f.fatura_tipi = 'normal' THEN f.id END) AS fatura_sayisi,
            COALESCE(SUM(CASE WHEN f.fatura_tipi = 'iade'
                              THEN -(d.adet * d.birim_fiyat)
                              ELSE (d.adet * d.birim_fiyat) END), 0) AS toplam_tutar,
            COALESCE(SUM(CASE WHEN f.fatura_tipi = 'iade'
                              THEN -(d.adet)
                              ELSE d.adet END), 0) AS toplam_adet
          FROM satis_faturalar f
          LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
          ${where}
    `);
    return rows[0] ?? { fatura_sayisi: 0, toplam_tutar: 0, toplam_adet: 0 };
}

// -------- TAHSİLAT --------
export async function satisFaturaTahsilatEkle(faturaId, veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const faturaRows = await conn.query(
            `SELECT f.id, f.odenen_tutar,
              COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam
         FROM satis_faturalar f
         LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
        WHERE f.id = ?
        GROUP BY f.id, f.odenen_tutar
        FOR UPDATE`,
            [faturaId]
        );
        const fatura = faturaRows[0];
        if (!fatura) throw new Error('Fatura bulunamadı.');

        const toplam = Number(fatura.toplam);
        const eskiOdenen = Number(fatura.odenen_tutar);
        const yeniOdenen = eskiOdenen + Number(veri.tutar);

        if (yeniOdenen > toplam + 0.01) {
            throw new Error(
                `Tahsilat fatura toplamını aşamaz. Kalan: ${(toplam - eskiOdenen).toFixed(2)} ₺`
            );
        }

        // Kasaya yatırılıyorsa kasa bakiye kontrolü GEREKMEZ (kasa artıyor)
        await conn.query(
            `INSERT INTO fatura_odemeleri
         (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
       VALUES ('satis', ?, ?, ?, ?, ?, ?)`,
            [faturaId, veri.tutar, veri.tarih,
                veri.aciklama ?? null,
                veri.kasaya_yatir ? 1 : 0, veri.kasa_id ?? null]
        );

        let durum = 'odenmedi';
        if (yeniOdenen >= toplam - 0.01) durum = 'odendi';
        else if (yeniOdenen > 0) durum = 'kismi';

        await conn.query(
            `UPDATE satis_faturalar
          SET odenen_tutar = ?, durum = ?
        WHERE id = ?`,
            [yeniOdenen, durum, faturaId]
        );

        await conn.commit();
        return { ok: true, yeniOdenen, durum };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function satisFaturaArsivle(id, { neden } = {}) {
    const res = await query(
        `UPDATE satis_faturalar
            SET arsivlendi = 1,
                arsiv_tarihi = NOW(),
                arsiv_nedeni = ?
          WHERE id = ? AND arsivlendi = 0`,
        [neden ?? null, id]
    );
    return Number(res.affectedRows);
}

export async function satisFaturaIadeEdilebilir(faturaId) {
    // Orijinal kalemler + iade edilmiş miktarlar
    return await query(
        `SELECT
            d.urun_id,
            u.urun_adi,
            d.adet AS orijinal_adet,
            d.birim_fiyat,
            COALESCE((
                SELECT SUM(iad.adet)
                  FROM satis_fatura_detaylari iad
                  JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = d.fatura_id
                   AND iadf.fatura_tipi = 'iade'
                   AND iad.urun_id = d.urun_id
            ), 0) AS iade_edilen,
            d.adet - COALESCE((
                SELECT SUM(iad.adet)
                  FROM satis_fatura_detaylari iad
                  JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = d.fatura_id
                   AND iadf.fatura_tipi = 'iade'
                   AND iad.urun_id = d.urun_id
            ), 0) AS iade_edilebilir
          FROM satis_fatura_detaylari d
          JOIN urunler u ON u.id = d.urun_id
         WHERE d.fatura_id = ?`,
        [faturaId]
    );
}

export async function satisIadeFaturaOlustur({ kaynak_fatura_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Kaynak faturayı bul (cari_id lazım)
        const kaynakRows = await conn.query(
            'SELECT id, cari_id, fatura_tipi FROM satis_faturalar WHERE id = ? FOR UPDATE',
            [kaynak_fatura_id]
        );
        const kaynak = kaynakRows[0];
        if (!kaynak) throw new Error('Kaynak fatura bulunamadı.');
        if (kaynak.fatura_tipi === 'iade') {
            throw new Error('İade faturasının iadesi yapılamaz.');
        }
        // İade faturası kaydı
        const basRes = await conn.query(
            `INSERT INTO satis_faturalar
              (cari_id, tarih, fatura_tipi, kaynak_fatura_id, durum, odenen_tutar)
             VALUES (?, ?, 'iade', ?, 'odendi', 0)`,
            [kaynak.cari_id, tarih, kaynak_fatura_id]
        );
        const yeniFaturaId = Number(basRes.insertId);

        for (const k of kalemler) {
            // İade edilebilir miktarı kontrol et
            const kontrolRows = await conn.query(
                `SELECT
                    (SELECT adet FROM satis_fatura_detaylari
                      WHERE fatura_id = ? AND urun_id = ?) AS orijinal,
                    COALESCE((
                      SELECT SUM(iad.adet) FROM satis_fatura_detaylari iad
                        JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
                       WHERE iadf.kaynak_fatura_id = ? AND iadf.fatura_tipi = 'iade'
                         AND iad.urun_id = ?
                    ), 0) AS onceki_iade`,
                [kaynak_fatura_id, k.urun_id, kaynak_fatura_id, k.urun_id]
            );
            const kontrol = kontrolRows[0];
            const kalan = Number(kontrol.orijinal ?? 0) - Number(kontrol.onceki_iade ?? 0);
            if (Number(k.adet) > kalan) {
                throw new Error(`İade miktarı kalanı aşıyor (ürün: ${k.urun_id}, kalan: ${kalan}).`);
            }
            // İade detayı
            await conn.query(
                `INSERT INTO satis_fatura_detaylari
                   (fatura_id, urun_id, adet, birim_fiyat)
                 VALUES (?, ?, ?, ?)`,
                [yeniFaturaId, k.urun_id, k.adet, k.birim_fiyat]
            );

            // Stok hareketi — iade = giriş (stok ARTAR)
            await conn.query(
                `INSERT INTO stok_hareketleri
                   (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, 'iade', ?, ?, 'satis_fatura', ?, ?)`,
                [k.urun_id, k.adet, `Satış iadesi #${yeniFaturaId}`, yeniFaturaId, tarih]
            );

            // Stok artır (varsayilan_satis_fiyati'na dokunma!)
            await conn.query(
                'UPDATE urunler SET stok = stok + ? WHERE id = ?',
                [k.adet, k.urun_id]
            );
        }

        // Otomatik kapanış kontrolü — net borç 0 ise
        const borcRows = await conn.query(`
    SELECT 
      COALESCE(SUM(
        (SELECT COALESCE(SUM(d.adet * d.birim_fiyat), 0)
           FROM satis_fatura_detaylari d WHERE d.fatura_id = f.id)
        - COALESCE(f.odenen_tutar, 0)
      ), 0) AS normal_borc,
      (SELECT COALESCE(SUM(iad.adet * iad.birim_fiyat), 0)
         FROM satis_fatura_detaylari iad
         JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
        WHERE iadf.cari_id = ?
          AND iadf.fatura_tipi = 'iade'
          AND iadf.arsivlendi = 0
          AND NOT EXISTS (
            SELECT 1 FROM fatura_odemeleri fo
             WHERE fo.fatura_id = iadf.id 
               AND fo.fatura_tipi = 'satis'
          )
      ) AS odenmemis_iade
      FROM satis_faturalar f
     WHERE f.cari_id = ?
       AND f.fatura_tipi = 'normal'
       AND f.arsivlendi = 0
       AND f.durum IN ('odenmedi', 'kismi')
`, [kaynak.cari_id, kaynak.cari_id]);

        const normalBorc = Number(borcRows[0]?.normal_borc ?? 0);
        const odenmemisIade = Number(borcRows[0]?.odenmemis_iade ?? 0);
        const netBorc = Math.max(0, normalBorc - odenmemisIade);

        if (netBorc <= 0.01) {
            const iadeToplam = kalemler.reduce(
                (s, k) => s + Number(k.adet) * Number(k.birim_fiyat), 0
            );
            // Ödeme kaydı (kasadan düşülmez)
            await conn.query(
                `INSERT INTO fatura_odemeleri
         (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
       VALUES ('satis', ?, ?, ?, 'Otomatik kapanış', 0, NULL)`,
                [yeniFaturaId, iadeToplam, tarih]
            );
            await conn.query(
                `UPDATE satis_faturalar SET odenen_tutar = ?, durum = 'odendi' WHERE id = ?`,
                [iadeToplam, yeniFaturaId]
            );
        }
        await conn.commit();
        return yeniFaturaId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function satisFaturaGeriAl(id) {
    const res = await query(
        `UPDATE satis_faturalar
            SET arsivlendi = 0, arsiv_tarihi = NULL, arsiv_nedeni = NULL
          WHERE id = ? AND arsivlendi = 1`,
        [id]
    );
    return Number(res.affectedRows);
}

export async function satisIadeOdemeEkle(faturaId, veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // İade faturasını kilitle
        const faturaRows = await conn.query(
            `SELECT f.id, f.cari_id, f.odenen_tutar, f.fatura_tipi,
              COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam
         FROM satis_faturalar f
         LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
        WHERE f.id = ?
        GROUP BY f.id, f.cari_id, f.odenen_tutar, f.fatura_tipi
        FOR UPDATE`,
            [faturaId]
        );
        const fatura = faturaRows[0];
        if (!fatura) throw new Error('Fatura bulunamadı.');
        if (fatura.fatura_tipi !== 'iade') {
            throw new Error('Bu fatura iade faturası değil.');
        }

        const toplam = Number(fatura.toplam);
        const eskiOdenen = Number(fatura.odenen_tutar);
        const yeniOdenen = eskiOdenen + Number(veri.tutar);

        if (yeniOdenen > toplam + 0.01) {
            throw new Error(
                `Ödeme iade toplamını aşamaz. Kalan: ${(toplam - eskiOdenen).toFixed(2)} ₺`
            );
        }

        const mahsup = veri.tip === 'mahsup';

        // Ödeme kaydı
        await conn.query(
            `INSERT INTO fatura_odemeleri
             (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
           VALUES ('satis', ?, ?, ?, ?, ?, ?)`,
            [
                faturaId,
                veri.tutar,
                veri.tarih,
                veri.aciklama ?? null,
                mahsup ? 0 : 1,
                mahsup ? null : veri.kasa_id,
            ]
        );

        // İade faturasının ödenen tutarını güncelle
        await conn.query(
            `UPDATE satis_faturalar
              SET odenen_tutar = ?, durum = 'odendi'
            WHERE id = ?`,
            [yeniOdenen, faturaId]
        );

        await conn.commit();
        return { ok: true, yeniOdenen };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// Müşterinin toplam borcunu hesapla
export async function musteriBorcuGetir(cariId) {
    const rows = await query(`
        SELECT 
          COALESCE(SUM(
            (SELECT COALESCE(SUM(d.adet * d.birim_fiyat), 0)
               FROM satis_fatura_detaylari d WHERE d.fatura_id = f.id)
            - COALESCE(f.odenen_tutar, 0)
          ), 0) AS normal_borc,
          (SELECT COALESCE(SUM(iad.adet * iad.birim_fiyat), 0)
             FROM satis_fatura_detaylari iad
             JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
            WHERE iadf.cari_id = ?
              AND iadf.fatura_tipi = 'iade'
              AND iadf.arsivlendi = 0
              AND NOT EXISTS (
                SELECT 1 FROM fatura_odemeleri fo
                 WHERE fo.fatura_id = iadf.id 
                   AND fo.fatura_tipi = 'satis'
              )
          ) AS odenmemis_iade
          FROM satis_faturalar f
         WHERE f.cari_id = ?
           AND f.fatura_tipi = 'normal'
           AND f.arsivlendi = 0
           AND f.durum IN ('odenmedi', 'kismi')
    `, [cariId, cariId]);

    const normalBorc = Number(rows[0]?.normal_borc ?? 0);
    const odenmemisIade = Number(rows[0]?.odenmemis_iade ?? 0);

    return Math.max(0, normalBorc - odenmemisIade);
}