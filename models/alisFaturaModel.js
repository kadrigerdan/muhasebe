import { query, getConnection } from '@/database/db';

export async function tumAlisFaturalar() {
    return await query(
        `SELECT f.id, f.tarih, c.unvan AS cari_unvan,
            COUNT(d.id) AS kalem_sayisi,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam
       FROM alis_faturalar f
       JOIN cariler c ON c.id = f.cari_id
       LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
      GROUP BY f.id, f.tarih, c.unvan
      ORDER BY f.tarih DESC, f.id DESC`
    );
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

export async function alisFaturaOlustur({ cari_id, tarih, kalemler }) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const basRes = await conn.query(
            'INSERT INTO alis_faturalar (cari_id, tarih) VALUES (?, ?)',
            [cari_id, tarih]
        );
        const faturaId = Number(basRes.insertId);

        for (const k of kalemler) {
            await conn.query(
                `INSERT INTO alis_fatura_detaylari
           (fatura_id, urun_id, miktar, birim_fiyat)
         VALUES (?, ?, ?, ?)`,
                [faturaId, k.urun_id, k.miktar, k.birim_fiyat]
            );

            await conn.query(
                `INSERT INTO stok_hareketleri
           (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
         VALUES (?, 'giris', ?, ?, 'alis_fatura', ?, ?)`,
                [k.urun_id, k.miktar, `Alış faturası #${faturaId}`, faturaId, tarih]
            );

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

export async function alisFaturaSil(id) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const kalemler = await conn.query(
            'SELECT urun_id, miktar FROM alis_fatura_detaylari WHERE fatura_id = ?',
            [id]
        );

        for (const k of kalemler) {
            await conn.query(
                'UPDATE urunler SET stok = stok - ? WHERE id = ?',
                [k.miktar, k.urun_id]
            );
        }

        await conn.query(
            "DELETE FROM stok_hareketleri WHERE kaynak = 'alis_fatura' AND kaynak_id = ?",
            [id]
        );
        await conn.query('DELETE FROM alis_fatura_detaylari WHERE fatura_id = ?', [id]);
        const res = await conn.query('DELETE FROM alis_faturalar WHERE id = ?', [id]);

        await conn.commit();
        return Number(res.affectedRows);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function alisMaliOzet() {
    const rows = await query(
        `SELECT
       COUNT(DISTINCT f.id) AS fatura_sayisi,
       COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam_tutar,
       COALESCE(SUM(d.miktar), 0) AS toplam_miktar
     FROM alis_faturalar f
     LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id`
    );
    return rows[0];
}