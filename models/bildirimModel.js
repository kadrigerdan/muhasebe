import { query } from '@/database/db';

// ==================== KRİTİK STOK ====================
export async function kritikStokBildirim() {
  const rows = await query(
    `SELECT id, urun_adi, stok, kritik_seviye
       FROM urunler
      WHERE durum = 1
        AND tip = 'hammadde'
        AND stok <= kritik_seviye
      ORDER BY stok ASC
      LIMIT 10`
  );
  return rows;
}

// ==================== ÖDENMEMİŞ FATURALAR ====================
export async function odenmemisFaturalar() {
  const satis = await query(
    `SELECT f.id, f.tarih, c.unvan AS cari, f.durum,
            COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam,
            f.odenen_tutar
       FROM satis_faturalar f
       JOIN cariler c ON c.id = f.cari_id
       LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
      WHERE f.durum IN ('odenmedi', 'kismi')
      GROUP BY f.id, f.tarih, c.unvan, f.durum, f.odenen_tutar
      ORDER BY f.tarih ASC
      LIMIT 10`
  );

  const alis = await query(
    `SELECT f.id, f.tarih, c.unvan AS cari, f.durum,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam,
            f.odenen_tutar
       FROM alis_faturalar f
       JOIN cariler c ON c.id = f.cari_id
       LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
      WHERE f.durum IN ('odenmedi', 'kismi')
      GROUP BY f.id, f.tarih, c.unvan, f.durum, f.odenen_tutar
      ORDER BY f.tarih ASC
      LIMIT 10`
  );

  return { satis, alis };
}

// ==================== UZUN SÜRE AÇIK ADİSYONLAR ====================
export async function uzunAdisyonlar() {
  return await query(
    `SELECT a.id, a.acilis_tarih, a.toplam,
            m.ad AS masa_ad,
            TIMESTAMPDIFF(MINUTE, a.acilis_tarih, NOW()) AS dakika
       FROM adisyonlar a
       JOIN masalar m ON m.id = a.masa_id
      WHERE a.durum = 'acik'
        AND TIMESTAMPDIFF(MINUTE, a.acilis_tarih, NOW()) >= 60
      ORDER BY a.acilis_tarih ASC
      LIMIT 10`
  );
}

// ==================== MUTFAKTA BEKLEYEN ====================
export async function mutfakBekleyenBildirim() {
  return await query(
    `SELECT COUNT(*) AS adet
       FROM adisyon_kalemleri k
       JOIN adisyonlar a ON a.id = k.adisyon_id
      WHERE a.durum = 'acik' AND k.mutfak_durum = 'bekliyor'`
  );
}

// ==================== BUGÜN VADESİ GELEN ====================
// Sistemde vade_tarihi olmadığı için alış faturalarının üzerinden 30 gün geçenler
export async function vadesiGecenFaturalar() {
  return await query(
    `SELECT f.id, f.tarih, c.unvan AS cari,
            COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam,
            f.odenen_tutar,
            DATEDIFF(NOW(), f.tarih) AS gun
       FROM alis_faturalar f
       JOIN cariler c ON c.id = f.cari_id
       LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
      WHERE f.durum IN ('odenmedi', 'kismi')
        AND DATEDIFF(NOW(), f.tarih) >= 30
      GROUP BY f.id, f.tarih, c.unvan, f.odenen_tutar
      ORDER BY gun DESC
      LIMIT 10`
  );
}

// ==================== TÜM BİLDİRİMLER ====================
export async function tumBildirimler() {
  const [kritikStok, faturalar, uzunAdisyon, mutfak, vadesiGecen] =
    await Promise.all([
      kritikStokBildirim(),
      odenmemisFaturalar(),
      uzunAdisyonlar(),
      mutfakBekleyenBildirim(),
      vadesiGecenFaturalar(),
    ]);

  return {
    kritikStok,
    odenmemisSatis: faturalar.satis,
    odenmemisAlis: faturalar.alis,
    uzunAdisyon,
    mutfakBekleyen: Number(mutfak[0]?.adet ?? 0),
    vadesiGecen,
  };
}
