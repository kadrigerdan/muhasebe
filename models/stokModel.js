import { query } from '@/database/db';

export async function stokOzet() {
    return await query(
        `SELECT u.id, u.urun_adi, u.stok, u.kritik_seviye,
            u.varsayilan_alis_fiyati, u.varsayilan_satis_fiyati,
            (u.stok * u.varsayilan_alis_fiyati) AS stok_degeri_alis,
            (u.stok * u.varsayilan_satis_fiyati) AS stok_degeri_satis,
            CASE
              WHEN u.stok <= 0 THEN 'tukendi'
              WHEN u.stok <= u.kritik_seviye THEN 'kritik'
              ELSE 'yeterli'
            END AS durum
       FROM urunler u
      WHERE u.durum = 1
      ORDER BY u.urun_adi`
    );
}

export async function stokHareketleri(urunId) {
    return await query(
        `SELECT h.*, u.urun_adi
       FROM stok_hareketleri h
       JOIN urunler u ON u.id = h.urun_id
      WHERE h.urun_id = ?
      ORDER BY h.tarih DESC h.id DESC
      LIMIT 100`,
        [urunId]
    );
}