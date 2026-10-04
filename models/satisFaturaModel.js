import { query, getConnection } from '@/database/db';

export async function tumSatisFaturalar() {
    return await query(
        `SELECT f.id, f.tarih, f.odenen_tutar, f.durum,
            c.unvan AS cari_unvan,
            COUNT(d.id) AS kalem_sayisi,
            COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam
       FROM satis_faturalar f
       JOIN cariler c ON c.id = f.cari_id
       LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
      GROUP BY f.id, f.tarih, f.odenen_tutar, f.durum, c.unvan
      ORDER BY f.tarih DESC, f.id DESC`
    );
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
    return fatura;
}

export async function satisFaturaOlustur({ cari_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Stok kontrolü (kilitli oku)
        for (const k of kalemler) {
            const [urun] = await conn.query(
                'SELECT id, urun_adi, stok FROM urunler WHERE id = ? FOR UPDATE',
                [k.urun_id]
            );
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

export async function satisFaturaSil(id) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const kalemler = await conn.query(
            'SELECT urun_id, adet FROM satis_fatura_detaylari WHERE fatura_id = ?',
            [id]
        );

        for (const k of kalemler) {
            await conn.query(
                'UPDATE urunler SET stok = stok + ? WHERE id = ?',
                [k.adet, k.urun_id]
            );
        }

        await conn.query(
            "DELETE FROM stok_hareketleri WHERE kaynak = 'satis_fatura' AND kaynak_id = ?",
            [id]
        );
        await conn.query('DELETE FROM satis_fatura_detaylari WHERE fatura_id = ?', [id]);
        const res = await conn.query('DELETE FROM satis_faturalar WHERE id = ?', [id]);

        await conn.commit();
        return Number(res.affectedRows);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function satisMaliOzet() {
    const rows = await query(
        `SELECT
       COUNT(DISTINCT f.id) AS fatura_sayisi,
       COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam_tutar,
       COALESCE(SUM(d.adet), 0) AS toplam_adet
     FROM satis_faturalar f
     LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id`
    );
    return rows[0];
}

// -------- TAHSİLAT --------
export async function satisFaturaTahsilatEkle(faturaId, veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [fatura] = await conn.query(
            `SELECT f.id, f.odenen_tutar,
              COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam
         FROM satis_faturalar f
         LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
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