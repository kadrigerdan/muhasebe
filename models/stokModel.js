import { query } from '@/database/db';

export async function stokOzet() {
    return await query(
        `SELECT u.id, u.urun_adi, u.stok, u.kritik_seviye,
            u.varsayilan_alis_fiyati, u.varsayilan_satis_fiyati,
            (u.stok * u.varsayilan_alis_fiyati) AS stok_degeri_alis,
            (u.stok * u.varsayilan_satis_fiyati) AS stok_degeri_satis,
            CASE
              WHEN u.stok <= 0 THEN 'tukendi'
              WHEN u.kritik_seviye IS NOT NULL AND u.stok <= u.kritik_seviye THEN 'kritik'
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
      ORDER BY h.tarih DESC, h.id DESC
      LIMIT 100`,
        [urunId]
    );
}

export async function stokListesiGetir() {
    const rows = await query(`
        SELECT u.*,
        COALESCE(SUM(us.stok),0) AS toplam_stok,
        COALESCE(
          JSON_ARRAYAGG(
            CASE
              WHEN us.depo_id IS NOT NULL THEN JSON_OBJECT(
              'depo_id', d.id,
              'depo_ad',d.ad,
              'stok',us.stok
              )
            END
        ),
         JSON_ARRAY()
    )    AS depo_stoklari
    FROM urunler u
    LEFT JOIN urun_stok us ON us.urun_id = u.id
    LEFTJOIN depolar d ON d.id = us.depo_id
    GROUP BY u.id
    ORDER BY u.id    
        `);

    return rows.map((u) => {
        const hamListe = Array.isArray(u.depo_stoklari)
            ? u.depo_stoklari
            : JSON.parse(u.depo_stoklari || '[]')

        const depoStoklari = hamListe.filter(Boolean);
        const toplamStok = depoStoklari.reduce(
            (acc, item) => acc + Number(item.stok ?? 0),
            0
        );

        return {
            ...u,
            depo_stoklari: depoStoklari,
            toplam_stok: toplamStok
        };
    });
}