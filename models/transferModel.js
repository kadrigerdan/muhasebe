import { query, getConnection } from '@/database/db';

export async function stokTransferEt({ gonderen_depo_id, alan_depo_id, urun_id, miktar, tarih, aciklama }) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1. Gönderen depoda stok var mı? (kilitli oku)
    const stokRows = await conn.query(
      `SELECT us.stok, u.urun_adi, u.kritik_seviye
               FROM urun_stok us
               JOIN urunler u ON u.id = us.urun_id
              WHERE us.urun_id = ? AND us.depo_id = ?
              FOR UPDATE`,
      [urun_id, gonderen_depo_id]
    );
    const mevcut = stokRows[0];
    if (!mevcut) {
      throw new Error('Ürün gönderen depoda bulunamadı.');
    }
    if (Number(mevcut.stok) < Number(miktar)) {
      throw new Error(
        `Yetersiz stok: ${mevcut.urun_adi} (mevcut: ${mevcut.stok}, istenen: ${miktar})`
      );
    }

    // 2. Gönderen depodan düş
    await conn.query(
      `UPDATE urun_stok SET stok = stok - ? 
              WHERE urun_id = ? AND depo_id = ?`,
      [miktar, urun_id, gonderen_depo_id]
    );

    // 3. Alan depoya ekle (yoksa oluştur)
    await conn.query(
      `INSERT INTO urun_stok (urun_id, depo_id, stok)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE stok = stok + VALUES(stok)`,
      [urun_id, alan_depo_id, miktar]
    );

    // 4. Transfer kaydı
    const trRes = await conn.query(
      `INSERT INTO stok_transferleri 
                (gonderen_depo_id, alan_depo_id, urun_id, miktar, tarih, aciklama)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [gonderen_depo_id, alan_depo_id, urun_id, miktar, tarih, aciklama ?? null]
    );
    const transferId = Number(trRes.insertId);

    // 5. Stok hareketleri (çıkış + giriş)
    await conn.query(
      `INSERT INTO stok_hareketleri
                (urun_id, depo_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
             VALUES (?, ?, 'cikis', ?, ?, 'transfer', ?, ?)`,
      [urun_id, gonderen_depo_id, miktar, `Transfer #${transferId} (çıkış)`, transferId, tarih]
    );
    await conn.query(
      `INSERT INTO stok_hareketleri
                (urun_id, depo_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
             VALUES (?, ?, 'giris', ?, ?, 'transfer', ?, ?)`,
      [urun_id, alan_depo_id, miktar, `Transfer #${transferId} (giriş)`, transferId, tarih]
    );

    await conn.commit();
    return transferId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}