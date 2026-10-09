import { query } from '@/database/db';

// Tüm aktif masalar
export async function tumMasalar() {
  return await query(
    `SELECT id, ad, tip, sira, aktif
       FROM masalar
      WHERE aktif = 1
      ORDER BY sira, ad`
  );
}

// Tek masa
export async function masaGetir(id) {
  const rows = await query('SELECT * FROM masalar WHERE id = ?', [id]);
  return rows[0] ?? null;
}

// Masalar + açık adisyon durumu (grid için)
export async function masaDurumlari() {
  return await query(
    `SELECT
       m.id, m.ad, m.tip, m.sira,
       a.id AS adisyon_id,
       a.acilis_tarih,
       a.toplam AS adisyon_toplam,
       COUNT(k.id) AS kalem_sayisi
     FROM masalar m
     LEFT JOIN adisyonlar a ON a.masa_id = m.id AND a.durum = 'acik'
     LEFT JOIN adisyon_kalemleri k ON k.adisyon_id = a.id
     WHERE m.aktif = 1
     GROUP BY m.id, m.ad, m.tip, m.sira,
              a.id, a.acilis_tarih, a.toplam
     ORDER BY m.sira, m.ad`
  );
}
