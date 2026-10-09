import { query, getConnection } from '@/database/db';

// Açık adisyonu getir (yoksa null)
export async function masaAcikAdisyon(masaId) {
    const rows = await query(
        `SELECT * FROM adisyonlar
      WHERE masa_id = ? AND durum = 'acik'
      LIMIT 1`,
        [masaId]
    );
    return rows[0] ?? null;
}

// Adisyon detayı + kalemler
export async function adisyonGetir(id) {
    const rows = await query(
        `SELECT a.*, m.ad AS masa_ad, m.tip AS masa_tip
       FROM adisyonlar a
       JOIN masalar m ON m.id = a.masa_id
      WHERE a.id = ?`,
        [id]
    );
    if (!rows.length) return null;

    const adisyon = rows[0];
    adisyon.kalemler = await query(
        `SELECT k.*, u.urun_adi
       FROM adisyon_kalemleri k
       JOIN urunler u ON u.id = k.urun_id
      WHERE k.adisyon_id = ?
      ORDER BY k.created_at, k.id`,
        [id]
    );
    return adisyon;
}

// Yeni adisyon aç
export async function adisyonAc(masaId) {
    const res = await query(
        'INSERT INTO adisyonlar (masa_id) VALUES (?)',
        [masaId]
    );
    return Number(res.insertId);
}

// Adisyona kalem ekle
export async function adisyonKalemEkle(adisyonId, urunId, adet) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [urun] = await conn.query(
            'SELECT id, urun_adi, varsayilan_satis_fiyati FROM urunler WHERE id = ?',
            [urunId]
        );
        if (!urun) throw new Error('Ürün bulunamadı.');

        const birimFiyat = Number(urun.varsayilan_satis_fiyati);

        // Aynı ürün sepette ('secildi') var mı?
        const [mevcut] = await conn.query(
            `SELECT id, adet FROM adisyon_kalemleri
        WHERE adisyon_id = ? AND urun_id = ? AND mutfak_durum = 'secildi'
        LIMIT 1`,
            [adisyonId, urunId]
        );

        if (mevcut) {
            // Adedi arttır
            const yeniAdet = Number(mevcut.adet) + Number(adet);
            const yeniToplam = birimFiyat * yeniAdet;
            await conn.query(
                `UPDATE adisyon_kalemleri
            SET adet = ?, toplam = ?
          WHERE id = ?`,
                [yeniAdet, yeniToplam, mevcut.id]
            );
        } else {
            // Yeni satır ekle
            const toplam = birimFiyat * Number(adet);
            await conn.query(
                `INSERT INTO adisyon_kalemleri
           (adisyon_id, urun_id, adet, birim_fiyat, toplam, mutfak_durum)
         VALUES (?, ?, ?, ?, ?,'secildi')`,
                [adisyonId, urunId, adet, birimFiyat, toplam]
            );
        }

        // Adisyon toplamını güncelle
        await conn.query(
            `UPDATE adisyonlar
          SET toplam = (SELECT COALESCE(SUM(toplam), 0)
                          FROM adisyon_kalemleri
                         WHERE adisyon_id = ?)
        WHERE id = ?`,
            [adisyonId, adisyonId]
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

// Kalem sil
export async function adisyonKalemSil(kalemId) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [kalem] = await conn.query(
            'SELECT adisyon_id FROM adisyon_kalemleri WHERE id = ?',
            [kalemId]
        );
        if (!kalem) throw new Error('Kalem bulunamadı.');

        await conn.query('DELETE FROM adisyon_kalemleri WHERE id = ?', [kalemId]);

        await conn.query(
            `UPDATE adisyonlar
          SET toplam = (SELECT COALESCE(SUM(toplam), 0)
                          FROM adisyon_kalemleri
                         WHERE adisyon_id = ?)
        WHERE id = ?`,
            [kalem.adisyon_id, kalem.adisyon_id]
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

// Ödeme al (adisonu kapat)
export async function adisyonKapat(adisyonId, kasaId, odemeYontemi) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [adisyon] = await conn.query(
            'SELECT * FROM adisyonlar WHERE id = ? FOR UPDATE',
            [adisyonId]
        );
        if (!adisyon) throw new Error('Adisyon bulunamadı.');
        if (adisyon.durum !== 'acik') throw new Error('Bu adisyon zaten kapalı.');

        const kalemler = await conn.query(
            'SELECT * FROM adisyon_kalemleri WHERE adisyon_id = ?',
            [adisyonId]
        );
        if (!kalemler.length) throw new Error('Boş adisyon kapatılamaz.');

        // Stok düş
        for (const k of kalemler) {
            await conn.query(
                `INSERT INTO stok_hareketleri
           (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
         VALUES (?, 'cikis', ?, ?, 'satis_fatura', ?, CURDATE())`,
                [k.urun_id, k.adet, `Masa satışı #${adisyonId}`, adisyonId]
            );

            await conn.query(
                'UPDATE urunler SET stok = stok - ? WHERE id = ?',
                [k.adet, k.urun_id]
            );
        }

        // Kasa hareketi
        if (kasaId && Number(adisyon.toplam) > 0) {
            await conn.query(
                `INSERT INTO kasa_hareketleri
           (kasa_id, tip, tutar, tarih, aciklama)
         VALUES (?, 'giris', ?, CURDATE(), ?)`,
                [kasaId, adisyon.toplam, `Masa ödemesi #${adisyonId} (${odemeYontemi})`]
            );
        }

        await conn.query(
            `UPDATE adisyonlar
          SET durum = 'kapali',
              kapanis_tarih = NOW(),
              kasa_id = ?,
              odeme_yontemi = ?
        WHERE id = ?`,
            [kasaId, odemeYontemi, adisyonId]
        );

        await conn.commit();
        return { ok: true, toplam: Number(adisyon.toplam) };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// Mutfak için bekleyen siparişler
export async function mutfakBekleyenler() {
    return await query(
        `SELECT
       k.id, k.adet, k.mutfak_durum, k.created_at,
       u.urun_adi,
       a.id AS adisyon_id,
       m.ad AS masa_ad, m.tip AS masa_tip
     FROM adisyon_kalemleri k
     JOIN urunler u ON u.id = k.urun_id
     JOIN adisyonlar a ON a.id = k.adisyon_id
     JOIN masalar m ON m.id = a.masa_id
     WHERE a.durum = 'acik'
       AND k.mutfak_durum IN ('bekliyor','hazir')
     ORDER BY k.created_at, k.id`
    );
}

// Mutfak durum güncelle
export async function mutfakDurumGuncelle(kalemId, yeniDurum) {
    const res = await query(
        'UPDATE adisyon_kalemleri SET mutfak_durum = ? WHERE id = ?',
        [yeniDurum, kalemId]
    );
    return Number(res.affectedRows);
}

// Özet istatistikler
export async function adisyonOzet() {
    const rows = await query(
        `SELECT
       (SELECT COUNT(*) FROM adisyonlar WHERE durum = 'acik') AS acik_adisyon,
       (SELECT COUNT(*) FROM adisyonlar
          WHERE durum = 'kapali' AND DATE(kapanis_tarih) = CURDATE()) AS bugun_kapanan,
       (SELECT COALESCE(SUM(toplam), 0) FROM adisyonlar
          WHERE durum = 'kapali' AND DATE(kapanis_tarih) = CURDATE()) AS bugun_ciro,
       (SELECT COUNT(*) FROM adisyon_kalemleri k
          JOIN adisyonlar a ON a.id = k.adisyon_id
         WHERE a.durum = 'acik' AND k.mutfak_durum = 'bekliyor') AS mutfak_bekleyen`
    );
    return rows[0];
}

// Bugünün tüm kapanan adisyonları
export async function bugunKapananAdisyonlar() {
    return await query(
        `SELECT a.id, a.toplam, a.kapanis_tarih, a.odeme_yontemi,
            m.ad AS masa_ad, m.tip AS masa_tip,
            k.ad AS kasa_ad
       FROM adisyonlar a
       JOIN masalar m ON m.id = a.masa_id
       LEFT JOIN kasa_hesaplari k ON k.id = a.kasa_id
      WHERE a.durum = 'kapali'
        AND DATE(a.kapanis_tarih) = CURDATE()
      ORDER BY a.kapanis_tarih DESC`
    );
}

// Adisyon iptal et (kalemlerle birlikte sil)
export async function adisyonIptal(id, sebep = 'musteri_iptal') {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [adisyon] = await conn.query(
            'SELECT * FROM adisyonlar WHERE id = ? FOR UPDATE',
            [id]
        );
        if (!adisyon) throw new Error('Adisyon bulunamadı.');
        if (adisyon.durum === 'kapali') {
            throw new Error('Kapanmış adisyon iptal edilemez.');
        }

        // Kalemleri kontrol et
        const kalemler = await conn.query(
            'SELECT id, urun_id, adet, mutfak_durum FROM adisyon_kalemleri WHERE adisyon_id = ?',
            [id]
        );

        // Mutfakta/hazır olanlar fire olur
        const fireKalemler = kalemler.filter(
            (k) => k.mutfak_durum === 'bekliyor' || k.mutfak_durum === 'hazir'
        );

        const sebepMap = {
            musteri_iptal: 'Müşteri vazgeçti',
            musteri_bekledi: 'Müşteri çok bekledi',
            siparis_hatasi: 'Sipariş yanlış girildi',
            malzeme_bitti: 'Malzeme bitti',
            diger: 'Diğer',
        };
        const sebepMetin = sebepMap[sebep] || 'Diğer';

        for (const k of fireKalemler) {
            await conn.query(
                `INSERT INTO stok_hareketleri
           (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
         VALUES (?, 'cikis', ?, ?, 'fire', ?, CURDATE())`,
                [k.urun_id, k.adet, `Adisyon #${id} iptal - ${sebepMetin}`, id]
            );

            await conn.query(
                'UPDATE urunler SET stok = stok - ? WHERE id = ?',
                [k.adet, k.urun_id]
            );
        }

        // Adisyonu sil
        await conn.query('DELETE FROM adisyon_kalemleri WHERE adisyon_id = ?', [id]);
        await conn.query('DELETE FROM adisyonlar WHERE id = ?', [id]);

        await conn.commit();
        return { ok: true, fire_adet: fireKalemler.length };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// Tüm 'secildi' kalemleri 'bekliyor' yap (mutfağa gönder)
export async function mutfagaGonder(adisyonId) {
    const res = await query(
        `UPDATE adisyon_kalemleri
        SET mutfak_durum = 'bekliyor'
      WHERE adisyon_id = ? AND mutfak_durum = 'secildi'`,
        [adisyonId]
    );
    return Number(res.affectedRows);
}

// Bekleyen 'secildi' kalem sayısı
export async function secilmisKalemSayisi(adisyonId) {
    const rows = await query(
        `SELECT COUNT(*) AS adet
       FROM adisyon_kalemleri
      WHERE adisyon_id = ? AND mutfak_durum = 'secildi'`,
        [adisyonId]
    );
    return Number(rows[0]?.adet ?? 0);
}

// Kalem adedini güncelle (0 veya altıysa sil)
export async function adisyonKalemAdetGuncelle(kalemId, yeniAdet) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [kalem] = await conn.query(
            'SELECT adisyon_id, birim_fiyat FROM adisyon_kalemleri WHERE id = ?',
            [kalemId]
        );
        if (!kalem) throw new Error('Kalem bulunamadı.');

        if (Number(yeniAdet) <= 0) {
            await conn.query('DELETE FROM adisyon_kalemleri WHERE id = ?', [kalemId]);
        } else {
            const yeniToplam = Number(kalem.birim_fiyat) * Number(yeniAdet);
            await conn.query(
                `UPDATE adisyon_kalemleri
            SET adet = ?, toplam = ?
          WHERE id = ?`,
                [yeniAdet, yeniToplam, kalemId]
            );
        }

        // Adisyon toplamını yenile
        await conn.query(
            `UPDATE adisyonlar
          SET toplam = (SELECT COALESCE(SUM(toplam), 0)
                          FROM adisyon_kalemleri
                         WHERE adisyon_id = ?)
        WHERE id = ?`,
            [kalem.adisyon_id, kalem.adisyon_id]
        );

        await conn.commit();
        return { ok: true, adisyon_id: Number(kalem.adisyon_id) };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function fireOzet({ baslangic, bitis }) {
    const rows = await query(
        `SELECT COUNT(*) AS adet, COALESCE(SUM(miktar), 0) AS toplam
       FROM stok_hareketleri
      WHERE kaynak = 'fire'
        AND DATE(tarih) BETWEEN ? AND ?`,
        [baslangic, bitis]
    );
    return rows[0];
}

export async function kapananAdisyonlar({ baslangic, bitis }) {
    return await query(
        `SELECT a.id, a.toplam, a.kapanis_tarih, a.odeme_yontemi,
            m.ad AS masa_ad, m.tip AS masa_tip,
            k.ad AS kasa_ad
       FROM adisyonlar a
       JOIN masalar m ON m.id = a.masa_id
       LEFT JOIN kasa_hesaplari k ON k.id = a.kasa_id
      WHERE a.durum = 'kapali'
        AND DATE(a.kapanis_tarih) BETWEEN ? AND ?
      ORDER BY a.kapanis_tarih DESC`,
        [baslangic, bitis]
    );
}

export async function donemOzet({ baslangic, bitis }) {
    const rows = await query(
        `SELECT
       COUNT(*) AS adisyon_sayisi,
       COALESCE(SUM(toplam), 0) AS toplam_ciro,
       COALESCE(AVG(toplam), 0) AS ortalama_hesap,
       SUM(CASE WHEN odeme_yontemi = 'nakit' THEN toplam ELSE 0 END) AS nakit,
       SUM(CASE WHEN odeme_yontemi = 'kredi_karti' THEN toplam ELSE 0 END) AS kredi_karti,
       SUM(CASE WHEN odeme_yontemi = 'pos' THEN toplam ELSE 0 END) AS pos,
       SUM(CASE WHEN odeme_yontemi = 'iban' THEN toplam ELSE 0 END) AS iban
     FROM adisyonlar
     WHERE durum = 'kapali'
       AND DATE(kapanis_tarih) BETWEEN ? AND ?`,
        [baslangic, bitis]
    );
    return rows[0];
}

export async function enCokSatanlar({ baslangic, bitis, limit = 10 }) {
    return await query(
        `SELECT u.urun_adi,
            SUM(k.adet) AS toplam_adet,
            SUM(k.toplam) AS toplam_tutar
       FROM adisyon_kalemleri k
       JOIN urunler u ON u.id = k.urun_id
       JOIN adisyonlar a ON a.id = k.adisyon_id
      WHERE a.durum = 'kapali'
        AND DATE(a.kapanis_tarih) BETWEEN ? AND ?
      GROUP BY u.id, u.urun_adi
      ORDER BY toplam_adet DESC
      LIMIT ?`,
        [baslangic, bitis, limit]
    );
}

// Mutfak ekranından kalem iptali (fire kaydı ile)
export async function mutfakIptal(kalemId) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        const [kalem] = await conn.query(
            'SELECT adisyon_id, urun_id, adet FROM adisyon_kalemleri WHERE id = ?',
            [kalemId]
        );
        if (!kalem) throw new Error('Kalem bulunamadı.');

        // Fire kaydı
        await conn.query(
            `INSERT INTO stok_hareketleri
         (urun_id, tip, miktar, aciklama, kaynak, kaynak_id, tarih)
       VALUES (?, 'cikis', ?, ?, 'fire', ?, CURDATE())`,
            [kalem.urun_id, kalem.adet, `Mutfak iptal - kalem #${kalemId}`, kalem.adisyon_id]
        );

        await conn.query(
            'UPDATE urunler SET stok = stok - ? WHERE id = ?',
            [kalem.adet, kalem.urun_id]
        );

        await conn.query('DELETE FROM adisyon_kalemleri WHERE id = ?', [kalemId]);

        // Adisyon toplamını güncelle
        await conn.query(
            `UPDATE adisyonlar
          SET toplam = (SELECT COALESCE(SUM(toplam), 0)
                          FROM adisyon_kalemleri
                         WHERE adisyon_id = ?)
        WHERE id = ?`,
            [kalem.adisyon_id, kalem.adisyon_id]
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
