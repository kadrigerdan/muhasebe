import { query, getConnection } from '@/database/db';

// -------- KASA HESAPLARI (view'den) --------
export async function tumKasaHesaplari() {
    return await query('SELECT * FROM kasa_bakiye_view ORDER BY tip, ad');
}

export async function aktifKasaHesaplari() {
    return await query(
        'SELECT * FROM kasa_bakiye_view WHERE aktif = 1 ORDER BY tip, ad'
    );
}

export async function kasaGetir(id) {
    const rows = await query('SELECT * FROM kasa_bakiye_view WHERE id = ?', [id]);
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

// -------- HAREKETLER (sadece manuel) --------
export async function kasaHareketleri(kasaId, limit = 200) {
    return await query(
        `SELECT id, tip, tutar, tarih, aciklama, created_at
       FROM kasa_hareketleri
      WHERE kasa_id = ?
      ORDER BY tarih DESC, id DESC
      LIMIT ?`,
        [kasaId, limit]
    );
}

export async function tumKasaHareketleri({ kasaId, tip } = {}) {
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

// Sadece manuel hareket ekler (transaction zorunlu — çağıran açar)
export async function hareketEkle(conn, veri) {
    const res = await conn.query(
        `INSERT INTO kasa_hareketleri
       (kasa_id, tip, tutar, tarih, aciklama)
     VALUES (?, ?, ?, ?, ?)`,
        [veri.kasa_id, veri.tip, veri.tutar, veri.tarih, veri.aciklama ?? null]
    );
    return Number(res.insertId);
}

// YENİ: Birleşik kasa ekstresi
export async function kasaEkstresi(kasaId, limit = 500) {
    return await query(
        `SELECT 'manuel' AS kaynak_tipi, h.id AS kaynak_id, h.tip AS yon,
            h.tutar, h.tarih, h.aciklama
       FROM kasa_hareketleri h
      WHERE h.kasa_id = ?

     UNION ALL

     SELECT 'personel_odeme' AS kaynak_tipi, po.id AS kaynak_id,
            'cikis' AS yon, po.tutar, po.tarih,
            CONCAT('Personel: ', p.ad, ' ', p.soyad, ' (', po.odeme_tipi, ')') AS aciklama
       FROM personel_odeme po
       JOIN personel p ON p.id = po.personel_id
      WHERE po.kasa_id = ? AND po.kasadan_dus = 1

     UNION ALL

     SELECT CONCAT('fatura_', fo.fatura_tipi) AS kaynak_tipi,
            fo.id AS kaynak_id,
            CASE WHEN fo.fatura_tipi = 'satis' THEN 'giris' ELSE 'cikis' END AS yon,
            fo.tutar, fo.tarih,
            CONCAT('Fatura #', fo.fatura_id, ' (', fo.fatura_tipi, ')') AS aciklama
       FROM fatura_odemeleri fo
      WHERE fo.kasa_id = ? AND fo.kasadan_dus = 1

      ORDER BY tarih DESC, kaynak_id DESC
      LIMIT ?`,
        [kasaId, kasaId, kasaId, limit]
    );
}

// -------- ÖZET --------
export async function kasaOzet() {
    const rows = await query(
        `SELECT
       COUNT(*) AS aktif_kasa_sayisi,
       COALESCE(SUM(bakiye), 0) AS toplam_bakiye
     FROM kasa_bakiye_view
     WHERE aktif = 1`
    );
    return rows[0];
}

export async function kasaTipOzet() {
    const rows = await query(
        `SELECT
       COALESCE(SUM(CASE WHEN tip = 'nakit' THEN bakiye ELSE 0 END), 0) AS nakit,
       COALESCE(SUM(CASE WHEN tip = 'banka' THEN bakiye ELSE 0 END), 0) AS banka,
       COALESCE(SUM(CASE WHEN tip = 'pos'   THEN bakiye ELSE 0 END), 0) AS pos,
       COALESCE(SUM(bakiye), 0) AS toplam
     FROM kasa_bakiye_view
     WHERE aktif = 1`
    );
    return rows[0];
}

// -------- VİRMAN (transfer) --------
export async function virmanYap(veri) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [kaynak] = await conn.query(
            'SELECT bakiye FROM kasa_bakiye_view WHERE id = ? FOR UPDATE',
            [veri.kaynak_id]
        );
        if (!kaynak) throw new Error('Kaynak kasa bulunamadı.');
        if (Number(kaynak.bakiye) < Number(veri.tutar)) {
            throw new Error(
                `Kaynak kasada yetersiz bakiye. Mevcut: ${Number(kaynak.bakiye).toFixed(2)} ₺`
            );
        }

        const [hedef] = await conn.query(
            'SELECT id, ad FROM kasa_hesaplari WHERE id = ?',
            [veri.hedef_id]
        );
        if (!hedef) throw new Error('Hedef kasa bulunamadı.');

        const [kaynakKasa] = await conn.query(
            'SELECT ad FROM kasa_hesaplari WHERE id = ?',
            [veri.kaynak_id]
        );

        await conn.query(
            `INSERT INTO kasa_hareketleri (kasa_id, tip, tutar, tarih, aciklama)
       VALUES (?, 'cikis', ?, ?, ?)`,
            [veri.kaynak_id, veri.tutar, veri.tarih,
            `Virman → ${hedef.ad}${veri.aciklama ? ' (' + veri.aciklama + ')' : ''}`]
        );

        await conn.query(
            `INSERT INTO kasa_hareketleri (kasa_id, tip, tutar, tarih, aciklama)
       VALUES (?, 'giris', ?, ?, ?)`,
            [veri.hedef_id, veri.tutar, veri.tarih,
            `Virman ← ${kaynakKasa.ad}${veri.aciklama ? ' (' + veri.aciklama + ')' : ''}`]
        );

        await conn.commit();
        return { ok: true };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}