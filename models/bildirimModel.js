import { query } from '@/database/db';

async function uzunAdisyonlar() {
  return await query(`
    SELECT a.id, a.masa_id, m.ad AS masa_ad, a.acilis_tarih,
           TIMESTAMPDIFF(HOUR, a.acilis_tarih, NOW()) AS saat
      FROM adisyonlar a
      LEFT JOIN masalar m ON m.id = a.masa_id
     WHERE a.durum = 'acik'
       AND TIMESTAMPDIFF(HOUR, a.acilis_tarih, NOW()) >= 3
     ORDER BY a.acilis_tarih ASC
  `);
}
// ==================== KRİTİK STOK ====================
export async function kritikStokBildirim() {
  const rows = await query(
    `SELECT id, urun_adi, stok, kritik_seviye,tip
       FROM urunler
      WHERE durum = 1
      AND kritik_seviye IS NOT NULL
      AND stok <= kritik_seviye
      ORDER BY stok ASC
      LIMIT 10`
  );
  return rows;
}




// ==================== ÖDENMEMİŞ FATURALAR ====================
async function odenmemisFaturalar() {
  const satisRows = await query(`
    SELECT f.id, f.tarih, c.unvan AS cari, f.durum,
           GREATEST(0,
             (SELECT COALESCE(SUM(d.adet * d.birim_fiyat), 0)
                FROM satis_fatura_detaylari d WHERE d.fatura_id = f.id)
             - COALESCE(f.odenen_tutar, 0)
             - (SELECT COALESCE(SUM(iad.adet * iad.birim_fiyat), 0)
                  FROM satis_fatura_detaylari iad
                  JOIN satis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = f.id
                   AND iadf.fatura_tipi = 'iade'
                   AND iadf.arsivlendi = 0)
           ) AS toplam,
           f.odenen_tutar
      FROM satis_faturalar f
      JOIN cariler c ON c.id = f.cari_id
     WHERE f.fatura_tipi = 'normal'
       AND f.durum IN ('odenmedi', 'kismi')
       AND f.arsivlendi = 0
       -- Tamamen iade edilmişleri hariç tut
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
       ) - 0.01
     ORDER BY f.tarih ASC
  `);

  const alisRows = await query(`
    SELECT f.id, f.tarih, c.unvan AS cari, f.durum,
           GREATEST(0,
             (SELECT COALESCE(SUM(d.miktar * d.birim_fiyat), 0)
                FROM alis_fatura_detaylari d WHERE d.fatura_id = f.id)
             - COALESCE(f.odenen_tutar, 0)
             - (SELECT COALESCE(SUM(iad.miktar * iad.birim_fiyat), 0)
                  FROM alis_fatura_detaylari iad
                  JOIN alis_faturalar iadf ON iadf.id = iad.fatura_id
                 WHERE iadf.kaynak_fatura_id = f.id
                   AND iadf.fatura_tipi = 'iade'
                   AND COALESCE(iadf.arsivlendi, 0) = 0)
           ) AS toplam,
           f.odenen_tutar
      FROM alis_faturalar f
      JOIN cariler c ON c.id = f.cari_id
     WHERE f.fatura_tipi = 'normal'
       AND f.durum IN ('odenmedi', 'kismi')
       AND COALESCE(f.arsivlendi, 0) = 0
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
       ) - 0.01
     ORDER BY f.tarih ASC
  `);

  return { satis: satisRows, alis: alisRows };
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

