import { query, getConnection } from '@/database/db';

export async function uretimYap({ depo_id, hammadde_id, hammadde_miktar, mamuller, tarih, aciklama }) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1. Hammadde stokta var mı?
    const stokRows = await conn.query(
      `SELECT us.stok, u.urun_adi FROM urun_stok us
             JOIN urunler u ON u.id = us.urun_id
             WHERE us.urun_id = ? AND us.depo_id = ? FOR UPDATE`,
      [hammadde_id, depo_id]
    );
    const mevcut = stokRows[0];
    if (!mevcut) throw new Error('Hammadde bu depoda bulunamadı.');
    if (Number(mevcut.stok) < Number(hammadde_miktar)) {
      throw new Error(`Yetersiz hammadde: ${mevcut.urun_adi} (mevcut: ${mevcut.stok}, istenen: ${hammadde_miktar})`);
    }

    // 2. Fire miktarını hesapla
    const toplamMamul = mamuller.reduce((s, m) => s + Number(m.miktar), 0);
    const fire_miktar = Number(hammadde_miktar) - toplamMamul;
    if (fire_miktar < 0) throw new Error('Üretilen mamul miktarı, hammadde miktarından fazla olamaz.');

    // 3. Üretim kaydı
    const kayitRes = await conn.query(
      `INSERT INTO uretim_kayitlari (depo_id, hammadde_id, hammadde_miktar, fire_miktar, tarih, aciklama)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [depo_id, hammadde_id, hammadde_miktar, fire_miktar, tarih, aciklama ?? null]
    );
    const uretimId = Number(kayitRes.insertId);

    // 4. Hammadde stoktan düş
    await conn.query(
      `UPDATE urun_stok SET stok = stok - ? WHERE urun_id = ? AND depo_id = ?`,
      [hammadde_miktar, hammadde_id, depo_id]
    );
    await conn.query(
      `INSERT INTO stok_hareketleri (urun_id, depo_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
             VALUES (?, ?, 'cikis', ?, ?, 'uretim', ?, ?)`,
      [hammadde_id, depo_id, hammadde_miktar, `Üretim #${uretimId} (hammadde)`, uretimId, tarih]
    );

    // 5. Mamulleri stoğa ekle
    for (const m of mamuller) {
      await conn.query(
        `INSERT INTO uretim_detaylari (uretim_id, mamul_id, miktar) VALUES (?, ?, ?)`,
        [uretimId, m.mamul_id, m.miktar]
      );
      await conn.query(
        `INSERT INTO urun_stok (urun_id, depo_id, stok) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE stok = stok + VALUES(stok)`,
        [m.mamul_id, depo_id, m.miktar]
      );
      await conn.query(
        `INSERT INTO stok_hareketleri (urun_id, depo_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, ?, 'giris', ?, ?, 'uretim', ?, ?)`,
        [m.mamul_id, depo_id, m.miktar, `Üretim #${uretimId} (mamul)`, uretimId, tarih]
      );
    }

    // 6. Fire kaydı (sadece stok hareketi olarak, negatif stok düşmez çünkü zaten hammaddeden düştü)
    if (fire_miktar > 0) {
      await conn.query(
        `INSERT INTO stok_hareketleri (urun_id, depo_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
                 VALUES (?, ?, 'cikis', ?, ?, 'fire', ?, ?)`,
        [hammadde_id, depo_id, fire_miktar, `Üretim #${uretimId} (fire)`, uretimId, tarih]
      );
    }

    await conn.commit();
    return uretimId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}