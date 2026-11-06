import { query, getConnection } from '@/database/db';

export async function tumAlisFaturalar({ gorunum = 'aktif' } = {}) {
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

    return await query(`
        SELECT f.id, f.tarih, f.odenen_tutar, f.durum, f.arsivlendi,
               f.fatura_tipi, f.kaynak_fatura_id,
               (SELECT COUNT(*) FROM alis_faturalar iad
                  WHERE iad.kaynak_fatura_id = f.id
                    AND iad.fatura_tipi = 'iade'
                    AND COALESCE(iad.arsivlendi, 0) = 0) AS iade_sayisi,
                    (SELECT COALESCE(SUM(iad.miktar * iad.birim_fiyat), 0)
   FROM alis_fatura_detaylari iad
   JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
  WHERE iadf.kaynak_fatura_id = f.id
    AND iadf.fatura_tipi = 'iade'
    AND COALESCE(iadf.arsivlendi, 0) = 0) AS iade_toplam,
                    CASE WHEN f.fatura_tipi = 'normal' 
  AND (SELECT COALESCE(SUM(iad.miktar), 0)
         FROM alis_fatura_detaylari iad
         JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
        WHERE iadf.kaynak_fatura_id = f.id 
          AND iadf.fatura_tipi = 'iade' 
          AND COALESCE(iadf.arsivlendi, 0) = 0
      ) >= (
        SELECT COALESCE(SUM(d2.miktar), 0)
          FROM alis_fatura_detaylari d2 
         WHERE d2.fatura_id = f.id
      ) - 0.01
  THEN 1 ELSE 0 END AS tamamen_iade,
               c.unvan AS cari_unvan,
               COUNT(d.id) AS kalem_sayisi,
               COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
          FROM alis_faturalar f
          JOIN cariler c ON c.id = f.cari_id
          LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
          ${where}
         GROUP BY f.id, f.tarih, f.odenen_tutar, f.durum, f.arsivlendi,
                  f.fatura_tipi, f.kaynak_fatura_id, c.unvan
         ORDER BY f.tarih DESC, f.id DESC
    `);
}



export async function alisFaturaGetir(id) {
    const rows = await query(
        `SELECT f.*, c.unvan AS cari_unvan
           FROM alis_faturalar f
           JOIN cariler c ON c.id = f.cari_id
          WHERE f.id = ?`,
        [id]
    );
    if (!rows.length) return null;

    const fatura = rows[0];
    fatura.kalemler = await query(
        `SELECT d.*, u.urun_adi, u.stok
           FROM alis_fatura_detaylari d
           JOIN urunler u ON u.id = d.urun_id
          WHERE d.fatura_id = ?`,
        [id]
    );

    fatura.toplam = fatura.kalemler.reduce(
        (s, k) => s + Number(k.miktar) * Number(k.birim_fiyat),
        0
    );

    // Bu faturaya kesilen iadelerin toplam tutarı
    const iadeRows = await query(
        `SELECT COALESCE(SUM(iad.miktar * iad.birim_fiyat), 0) AS iade_toplam
           FROM alis_fatura_detaylari iad
           JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
          WHERE iadf.kaynak_fatura_id = ?
            AND iadf.fatura_tipi = 'iade'
            AND COALESCE(iadf.arsivlendi, 0) = 0`,
        [id]
    );
    fatura.iade_toplam = Number(iadeRows[0]?.iade_toplam ?? 0);

    // YENİ: Kullanılabilir iade alacağı (başka faturalara mahsup için)
    const krediRows = await query(
        `SELECT COALESCE(SUM(
            (SELECT COALESCE(SUM(d.miktar * d.birim_fiyat), 0)
               FROM alis_fatura_detaylari d WHERE d.fatura_id = iadf.id)
            - COALESCE(iadf.odenen_tutar, 0)
          ), 0) AS kullanilabilir
           FROM alis_faturalar iadf
          WHERE iadf.cari_id = ?
            AND iadf.fatura_tipi = 'iade'
            AND COALESCE(iadf.arsivlendi, 0) = 0`,
        [fatura.cari_id]
    );
    fatura.iade_kullanilabilir = Number(krediRows[0]?.kullanilabilir ?? 0);

    return fatura;
}

export async function alisIadeFaturaOlustur({ kaynak_fatura_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // 1. Kaynak faturayı bul
        const kaynakRows = await conn.query(
            'SELECT id, cari_id, fatura_tipi FROM alis_faturalar WHERE id = ? FOR UPDATE',
            [kaynak_fatura_id]
        );
        const kaynak = kaynakRows[0];
        if (!kaynak) throw new Error('Kaynak fatura bulunamadı.');
        if (kaynak.fatura_tipi === 'iade') {
            throw new Error('İade faturasının iadesi yapılamaz.');
        }

        // 2. İade faturası kaydı
        const basRes = await conn.query(
            `INSERT INTO alis_faturalar
              (cari_id, tarih, fatura_tipi, kaynak_fatura_id, durum, odenen_tutar)
             VALUES (?, ?, 'iade', ?, 'odendi', 0)`,
            [kaynak.cari_id, tarih, kaynak_fatura_id]
        );
        const yeniFaturaId = Number(basRes.insertId);

        if (!Number.isFinite(yeniFaturaId) || yeniFaturaId <= 0) {
            throw new Error('İade faturası oluşturulamadı (insertId alınamadı).');
        }

        // 3. Her kalem için işlem
        for (const k of kalemler) {
            // 3a. Ürün + stok kontrolü
            const urunRows = await conn.query(
                'SELECT stok, urun_adi FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
            const urun = urunRows[0];
            if (!urun) throw new Error(`Ürün bulunamadı: ${k.urun_id}`);
            if (Number(urun.stok) < Number(k.miktar)) {
                throw new Error(
                    `Yetersiz stok: ${urun.urun_adi} (mevcut: ${urun.stok}, iade: ${k.miktar})`
                );
            }

            // 3b. İade edilebilir miktar kontrolü
            const kontrolRows = await conn.query(
                `SELECT
                    (SELECT miktar FROM alis_fatura_detaylari
                      WHERE fatura_id = ? AND urun_id = ?) AS orijinal,
                    COALESCE((
                      SELECT SUM(iad.miktar) FROM alis_fatura_detaylari iad
                        JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
                       WHERE iadf.kaynak_fatura_id = ? AND iadf.fatura_tipi = 'iade'
                         AND iad.urun_id = ?
                    ), 0) AS onceki_iade`,
                [kaynak_fatura_id, k.urun_id, kaynak_fatura_id, k.urun_id]
            );
            const kontrol = kontrolRows[0];
            const orijinal = Number(kontrol?.orijinal ?? 0);
            const oncekiIade = Number(kontrol?.onceki_iade ?? 0);
            const kalan = orijinal - oncekiIade;

            if (orijinal === 0) {
                throw new Error(`Ürün bu faturada yok (ürün id: ${k.urun_id}).`);
            }
            if (Number(k.miktar) > kalan) {
                throw new Error(
                    `İade miktarı kalanı aşıyor (kalan: ${kalan}).`
                );
            }

            // 3c. İade detayı
            await conn.query(
                `INSERT INTO alis_fatura_detaylari
                   (fatura_id, urun_id, miktar, birim_fiyat)
                 VALUES (?, ?, ?, ?)`,
                [yeniFaturaId, k.urun_id, k.miktar, k.birim_fiyat]
            );

            // 3d. Stok hareketi
            // Ürünün kritik_seviye'sini çek (stok takibi var mı?)
            const urunBilgiRows = await conn.query(
                'SELECT kritik_seviye FROM urunler WHERE id = ?',
                [k.urun_id]
            );
            const stokTakipli = urunBilgiRows[0]?.kritik_seviye != null;

            if (stokTakipli) {
                // Stok hareketi — iade = giriş (stok ARTAR)
                await conn.query(
                    `INSERT INTO stok_hareketleri
           (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
         VALUES (?, 'iade', ?, ?, 'satis_fatura', ?, ?)`,
                    [k.urun_id, k.adet, `Satış iadesi #${yeniFaturaId}`, yeniFaturaId, tarih]
                );

                // Stok artır
                await conn.query(
                    'UPDATE urunler SET stok = stok + ? WHERE id = ?',
                    [k.adet, k.urun_id]
                );
            }
        }

        // alisIadeFaturaOlustur içinde, for döngüsünden sonra, commit'ten önce:
        const borcRows = await conn.query(`
    SELECT 
      COALESCE(SUM(
        (SELECT COALESCE(SUM(d.miktar * d.birim_fiyat), 0)
           FROM alis_fatura_detaylari d WHERE d.fatura_id = f.id)
        - COALESCE(f.odenen_tutar, 0)
      ), 0) AS normal_borc,
      (SELECT COALESCE(SUM(iad.miktar * iad.birim_fiyat), 0)
         FROM alis_fatura_detaylari iad
         JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
        WHERE iadf.cari_id = ?
          AND iadf.fatura_tipi = 'iade'
          AND COALESCE(iadf.arsivlendi, 0) = 0
          AND NOT EXISTS (
            SELECT 1 FROM fatura_odemeleri fo
             WHERE fo.fatura_id = iadf.id 
               AND fo.fatura_tipi = 'alis'
          )
      ) AS odenmemis_iade
      FROM alis_faturalar f
     WHERE f.cari_id = ?
       AND f.fatura_tipi = 'normal'
       AND COALESCE(f.arsivlendi, 0) = 0
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


export async function alisFaturaArsivle(id, { neden } = {}) {
    const res = await query(
        `UPDATE alis_faturalar
            SET arsivlendi = 1, arsiv_tarihi = NOW(), arsiv_nedeni = ?
          WHERE id = ? AND arsivlendi = 0`,
        [neden ?? null, id]
    );
    return Number(res.affectedRows);
}

export async function alisFaturaGeriAl(id) {
    const res = await query(
        `UPDATE alis_faturalar
            SET arsivlendi = 0, arsiv_tarihi = NULL, arsiv_nedeni = NULL
          WHERE id = ? AND arsivlendi = 1`,
        [id]
    );
    return Number(res.affectedRows);
}

export async function alisMaliOzet({ gorunum = 'aktif' } = {}) {
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
                              THEN -(d.miktar * d.birim_fiyat)
                              ELSE (d.miktar * d.birim_fiyat) END), 0) AS toplam_tutar,
            COALESCE(SUM(CASE WHEN f.fatura_tipi = 'iade'
                              THEN -(d.miktar)
                              ELSE d.miktar END), 0) AS toplam_miktar
          FROM alis_faturalar f
          LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
          ${where}
    `);
    return rows[0] ?? { fatura_sayisi: 0, toplam_tutar: 0, toplam_miktar: 0 };
}

// -------- ÖDEME --------
// Faturaya ödeme ekle + durum güncelle + (opsiyonel) kasa hareketi
export async function alisFaturaOdemeEkle(faturaId, veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Faturayı kilitle
        const faturaRows = await conn.query(
            `SELECT f.id, f.odenen_tutar,
              COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
         FROM alis_faturalar f
         LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
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
                `Ödeme fatura toplamını aşamaz. Kalan: ${(toplam - eskiOdenen).toFixed(2)} ₺`
            );
        }

        // Kasa bakiye kontrolü
        if (veri.kasadan_dus && veri.kasa_id) {
            const kasaRows = await conn.query(
                'SELECT bakiye FROM kasa_bakiye_view WHERE id = ? FOR UPDATE',
                [veri.kasa_id]
            );
            const kasa = kasaRows[0];
            if (!kasa) throw new Error('Kasa bulunamadı.');
            if (Number(kasa.bakiye) < Number(veri.tutar)) {
                throw new Error(
                    `Yetersiz kasa bakiyesi. Mevcut: ${Number(kasa.bakiye).toFixed(2)} ₺`
                );
            }
        }

        // Fatura ödeme kaydı
        await conn.query(
            `INSERT INTO fatura_odemeleri
         (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
       VALUES ('alis', ?, ?, ?, ?, ?, ?)`,
            [faturaId, veri.tutar, veri.tarih,
                veri.aciklama ?? null,
                veri.kasadan_dus ? 1 : 0, veri.kasa_id ?? null]
        );

        // Fatura durumunu güncelle
        let durum = 'odenmedi';
        if (yeniOdenen >= toplam - 0.01) durum = 'odendi';
        else if (yeniOdenen > 0) durum = 'kismi';

        await conn.query(
            `UPDATE alis_faturalar
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

export async function alisFaturaIadeEdilebilir(faturaId) {
    return await query(
        `SELECT
            d.urun_id,
            u.urun_adi,
            d.miktar AS orijinal_miktar,
            d.birim_fiyat,
            COALESCE((
                SELECT SUM(iad.miktar)
                  FROM alis_fatura_detaylari iad
                  JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = d.fatura_id
                   AND iadf.fatura_tipi = 'iade'
                   AND iad.urun_id = d.urun_id
            ), 0) AS iade_edilen,
            d.miktar - COALESCE((
                SELECT SUM(iad.miktar)
                  FROM alis_fatura_detaylari iad
                  JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = d.fatura_id
                   AND iadf.fatura_tipi = 'iade'
                   AND iad.urun_id = d.urun_id
            ), 0) AS iade_edilebilir
          FROM alis_fatura_detaylari d
          JOIN urunler u ON u.id = d.urun_id
         WHERE d.fatura_id = ?`,
        [faturaId]
    );
}

export async function alisFaturaOlustur({ cari_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Ürün kontrolü + kilit
        for (const k of kalemler) {
            const urunRows = await conn.query(
                'SELECT id, urun_adi FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
            const urun = urunRows[0];
            if (!urun) {
                throw new Error(`Ürün bulunamadı: ${k.urun_id}`);
            }
        }

        // Fatura başlığı
        const basRes = await conn.query(
            "INSERT INTO alis_faturalar (cari_id, tarih, durum, odenen_tutar) VALUES (?, ?, 'odenmedi', 0)",
            [cari_id, tarih]
        );
        const faturaId = Number(basRes.insertId);

        if (!Number.isFinite(faturaId) || faturaId <= 0) {
            throw new Error('Fatura başlığı oluşturulamadı (insertId alınamadı).');
        }

        // Kalemler — GERÇEK KOD
        for (const k of kalemler) {
            // 1. Fatura detayı
            await conn.query(
                `INSERT INTO alis_fatura_detaylari
                   (fatura_id, urun_id, miktar, birim_fiyat)
                 VALUES (?, ?, ?, ?)`,
                [faturaId, k.urun_id, k.miktar, k.birim_fiyat]
            );

            // 2. Stok hareketi (giriş)
            await conn.query(
                `INSERT INTO stok_hareketleri
                   (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, 'giris', ?, ?, 'alis_fatura', ?, ?)`,
                [
                    k.urun_id,
                    k.miktar,
                    `Alış faturası #${faturaId}`,
                    faturaId,
                    tarih,
                ]
            );

            // 3. Stok artır + varsayılan alış fiyatı güncelle
            // Ürünün kritik_seviye'sini çek
            const urunBilgiRows = await conn.query(
                'SELECT kritik_seviye FROM urunler WHERE id = ?',
                [k.urun_id]
            );
            const stokTakipli = urunBilgiRows[0]?.kritik_seviye != null;

            if (stokTakipli) {
                // Stok artır + fiyat güncelle
                await conn.query(
                    `UPDATE urunler
            SET stok = stok + ?, varsayilan_alis_fiyati = ?
          WHERE id = ?`,
                    [k.miktar, k.birim_fiyat, k.urun_id]
                );
            } else {
                // Stok takibi yok → sadece fiyat
                await conn.query(
                    'UPDATE urunler SET varsayilan_alis_fiyati = ? WHERE id = ?',
                    [k.birim_fiyat, k.urun_id]
                );
            }
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

export async function alisIadeOdemeEkle(faturaId, veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // İade faturasını kilitle
        const faturaRows = await conn.query(
            `SELECT f.id, f.odenen_tutar, f.fatura_tipi,
              COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
         FROM alis_faturalar f
         LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
        WHERE f.id = ?
        GROUP BY f.id, f.odenen_tutar, f.fatura_tipi
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

        // Mahsup: kasadan düşülmez
        await conn.query(
            `INSERT INTO fatura_odemeleri
             (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
           VALUES ('alis', ?, ?, ?, ?, 0, NULL)`,
            [faturaId, veri.tutar, veri.tarih, veri.aciklama ?? null]
        );

        // İade faturasının ödenen tutarını güncelle
        await conn.query(
            `UPDATE alis_faturalar
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

export async function alisFaturaMahsupEkle(faturaId, { tutar, tarih }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Faturayı kilitle
        const faturaRows = await conn.query(
            `SELECT f.id, f.cari_id, f.odenen_tutar,
              COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
             FROM alis_faturalar f
             LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
            WHERE f.id = ?
            GROUP BY f.id, f.cari_id, f.odenen_tutar
            FOR UPDATE`,
            [faturaId]
        );
        const fatura = faturaRows[0];
        if (!fatura) throw new Error('Fatura bulunamadı.');

        // Kullanılabilir iade alacağını kontrol et
        const krediRows = await conn.query(
            `SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM(d.miktar * d.birim_fiyat), 0)
                   FROM alis_fatura_detaylari d WHERE d.fatura_id = iadf.id)
                - COALESCE(iadf.odenen_tutar, 0)
              ), 0) AS kullanilabilir
               FROM alis_faturalar iadf
              WHERE iadf.cari_id = ?
                AND iadf.fatura_tipi = 'iade'
                AND COALESCE(iadf.arsivlendi, 0) = 0`,
            [fatura.cari_id]
        );
        const kullanilabilir = Number(krediRows[0]?.kullanilabilir ?? 0);

        if (tutar > kullanilabilir + 0.01) {
            throw new Error(
                `Yetersiz iade alacağı. Kullanılabilir: ${kullanilabilir.toFixed(2)} ₺`
            );
        }

        const eskiOdenen = Number(fatura.odenen_tutar);
        const yeniOdenen = eskiOdenen + Number(tutar);
        const toplam = Number(fatura.toplam);

        if (yeniOdenen > toplam + 0.01) {
            throw new Error('Mahsup fatura toplamını aşamaz.');
        }

        // Ödeme kaydı (kasadan_dus=0 — kasa etkilenmez)
        await conn.query(
            `INSERT INTO fatura_odemeleri
             (fatura_tipi, fatura_id, tutar, tarih, aciklama, kasadan_dus, kasa_id)
           VALUES ('alis', ?, ?, ?, 'İade alacağından mahsup', 0, NULL)`,
            [faturaId, tutar, tarih]
        );

        // Fatura durumunu güncelle
        let durum = 'odenmedi';
        if (yeniOdenen >= toplam - 0.01) durum = 'odendi';
        else if (yeniOdenen > 0) durum = 'kismi';

        await conn.query(
            `UPDATE alis_faturalar SET odenen_tutar = ?, durum = ? WHERE id = ?`,
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