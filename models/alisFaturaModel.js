import { query, getConnection } from '@/database/db';

export async function tumAlisFaturalar({ gorunum = 'aktif' } = {}) {
    const where =
        gorunum === 'arsiv' ? 'WHERE f.arsivlendi = 1'
            : gorunum === 'aktif' ? 'WHERE f.arsivlendi = 0'
                : '';

    return await query(`
        SELECT f.id, f.tarih, f.odenen_tutar, f.durum, f.arsivlendi,
               f.fatura_tipi, f.kaynak_fatura_id,
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
        `SELECT d.*, u.urun_adi
       FROM alis_fatura_detaylari d
       JOIN urunler u ON u.id = d.urun_id
      WHERE d.fatura_id = ?`,
        [id]
    );

    fatura.toplam = fatura.kalemler.reduce(
        (s, k) => s + Number(k.miktar) * Number(k.birim_fiyat),
        0
    );
    return fatura;
}

export async function alisIadeFaturaOlustur({ kaynak_fatura_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // 1. Kaynak faturayı bul
        const [kaynak] = await conn.query(
            'SELECT id, cari_id, fatura_tipi FROM alis_faturalar WHERE id = ? FOR UPDATE',
            [kaynak_fatura_id]
        );
        if (!kaynak) throw new Error('Kaynak fatura bulunamadı.');
        if (kaynak.fatura_tipi === 'iade') {
            throw new Error('İade faturasının iadesi yapılamaz.');
        }

        // 2. İade faturası kaydı
        const [basRes] = await conn.query(
            `INSERT INTO alis_faturalar
              (cari_id, tarih, fatura_tipi, kaynak_fatura_id)
             VALUES (?, ?, 'iade', ?)`,
            [kaynak.cari_id, tarih, kaynak_fatura_id]
        );
        const yeniFaturaId = Number(basRes.insertId);

        // 3. Her kalem için işlem
        for (const k of kalemler) {
            // 3a. Ürün var mı + stok yeterli mi? (kilitli oku)
            const [urun] = await conn.query(
                'SELECT stok, urun_adi FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
            if (!urun) {
                throw new Error(`Ürün bulunamadı: ${k.urun_id}`);
            }
            if (Number(urun.stok) < Number(k.miktar)) {
                throw new Error(
                    `Yetersiz stok: ${urun.urun_adi} (mevcut: ${urun.stok}, iade: ${k.miktar}). ` +
                    `Bu mal satılmış olabilir.`
                );
            }

            // 3b. İade edilebilir miktar kontrolü (orijinal faturaya göre)
            const [kontrol] = await conn.query(
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

            const orijinal = Number(kontrol?.orijinal ?? 0);
            const oncekiIade = Number(kontrol?.onceki_iade ?? 0);
            const kalan = orijinal - oncekiIade;

            if (orijinal === 0) {
                throw new Error(
                    `Ürün bu faturada yok (ürün id: ${k.urun_id}).`
                );
            }
            if (Number(k.miktar) > kalan) {
                throw new Error(
                    `İade miktarı kalanı aşıyor (ürün id: ${k.urun_id}, ` +
                    `orijinal: ${orijinal}, önceki iade: ${oncekiIade}, kalan: ${kalan}).`
                );
            }

            // 3c. İade detayı
            await conn.query(
                `INSERT INTO alis_fatura_detaylari
                   (fatura_id, urun_id, miktar, birim_fiyat)
                 VALUES (?, ?, ?, ?)`,
                [yeniFaturaId, k.urun_id, k.miktar, k.birim_fiyat]
            );

            // 3d. Stok hareketi — alış iadesi = çıkış
            await conn.query(
                `INSERT INTO stok_hareketleri
                   (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, 'alis_iade', ?, ?, 'alis_fatura', ?, ?)`,
                [
                    k.urun_id,
                    k.miktar,
                    `Alış iadesi #${yeniFaturaId} (kaynak #${kaynak_fatura_id})`,
                    yeniFaturaId,
                    tarih,
                ]
            );

            // 3e. Stok azalt (varsayilan_alis_fiyati'na DOKUNMA)
            await conn.query(
                'UPDATE urunler SET stok = stok - ? WHERE id = ?',
                [k.miktar, k.urun_id]
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
        gorunum === 'arsiv' ? 'WHERE f.arsivlendi = 1'
            : gorunum === 'aktif' ? 'WHERE f.arsivlendi = 0'
                : '';

    const rows = await query(`
        SELECT
            COUNT(DISTINCT f.id) AS fatura_sayisi,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam_tutar,
            COALESCE(SUM(d.miktar), 0) AS toplam_miktar
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
        const [fatura] = await conn.query(
            `SELECT f.id, f.odenen_tutar,
              COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
         FROM alis_faturalar f
         LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
        WHERE f.id = ?
        GROUP BY f.id, f.odenen_tutar
        FOR UPDATE`,
            [faturaId]
        );
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
            const [kasa] = await conn.query(
                'SELECT bakiye FROM kasa_bakiye_view WHERE id = ? FOR UPDATE',
                [veri.kasa_id]
            );
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

        // Ürün kontrolü + kilit (stok artacağı için yeterlilik kontrolü gerekmez)
        for (const k of kalemler) {
            const [urun] = await conn.query(
                'SELECT id, urun_adi FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
            if (!urun) {
                throw new Error(`Ürün bulunamadı: ${k.urun_id}`);
            }
        }

        // Fatura başlığı
        const basRes = await conn.query(
            'INSERT INTO alis_faturalar (cari_id, tarih) VALUES (?, ?)',
            [cari_id, tarih]
        );
        const faturaId = Number(basRes.insertId);

        // Kalemler
        for (const k of kalemler) {
            // Detay — alışta sütun adı 'miktar'
            await conn.query(
                `INSERT INTO alis_fatura_detaylari
                   (fatura_id, urun_id, miktar, birim_fiyat)
                 VALUES (?, ?, ?, ?)`,
                [faturaId, k.urun_id, k.miktar, k.birim_fiyat]
            );

            // Stok hareketi — alış = giriş
            await conn.query(
                `INSERT INTO stok_hareketleri
                   (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, 'giris', ?, ?, 'alis_fatura', ?, ?)`,
                [k.urun_id, k.miktar, `Alış faturası #${faturaId}`, faturaId, tarih]
            );

            // Stok artır + varsayılan alış fiyatı güncelle
            await conn.query(
                `UPDATE urunler
                    SET stok = stok + ?, varsayilan_alis_fiyati = ?
                  WHERE id = ?`,
                [k.miktar, k.birim_fiyat, k.urun_id]
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