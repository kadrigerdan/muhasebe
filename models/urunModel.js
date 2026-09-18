import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Aktif ürün listesi (dropdown'lar için)
export async function getAktifUrunler() {
  try {
    return await query(
      `SELECT 
         id, 
         urun_adi,
         varsayilan_alis_fiyati,
         varsayilan_satis_fiyati,
         stok
       FROM urunler 
       WHERE durum = 1 
       ORDER BY urun_adi ASC`
    );
  } catch (error) {
    console.error("Ürünler alınamadı:", error);
    return [];
  }
}

// Stok listesi
export async function getStoklar() {
  try {
    return await query(`
      SELECT 
        id,
        urun_adi AS cinsi,
        stok AS adet,
        kritik_seviye
      FROM urunler
      ORDER BY urun_adi ASC
    `);
  } catch (error) {
    console.error("Stoklar alınamadı:", error);
    return [];
  }
}

// Stok düş (satışta) — urun_id ile
export async function stokGuncelle(conn, { urunId, satilanAdet }) {
  const adet = Number(satilanAdet || 0);

  const queryFn = conn
    ? (conn.execute ? conn.execute.bind(conn) : conn.query.bind(conn))
    : query;

  return await queryFn(
    `UPDATE urunler 
     SET stok = GREATEST(0, stok - ?) 
     WHERE id = ?`,
    [adet, urunId]
  );
}

// Stok ekle (manuel)
export async function stokEkle({ urunId, adet }) {
  try {
    await query(
      `UPDATE urunler SET stok = stok + ? WHERE id = ?`,
      [Number(adet), urunId]
    );
    revalidatePath("/stok");
    return { success: true };
  } catch (error) {
    console.error("Stok eklenemedi:", error);
    return { success: false, error: "Stok eklenemedi" };
  }
}

// Stok adedini doğrudan ayarla
export async function stokGuncelleAdet({ urunId, adet }) {
  try {
    await query(
      `UPDATE urunler SET stok = ? WHERE id = ?`,
      [Number(adet), urunId]
    );
    revalidatePath("/stok");
    return { success: true };
  } catch (error) {
    console.error("Stok güncellenemedi:", error);
    return { success: false, error: "Stok güncellenemedi" };
  }
}

// Satış faturası kes
export async function satisFaturasiKes(data) {
  const { musteri_id, tarih, urunler } = data;

  try {
    // 1. Ana fatura kaydı
    const fatura_Result = await query(
      `INSERT INTO satis_faturalar (musteri_id, tarih) VALUES (?, ?)`,
      [musteri_id, tarih]
    );

    const faturaId = fatura_Result.insertId ?? fatura_Result[0]?.insertId;
    if (!faturaId) throw new Error("Fatura ID alınamadı.");

    // 2. Detaylar ve stok düşümü
    if (Array.isArray(urunler) && urunler.length > 0) {
      for (const item of urunler) {
        const urunId = Number(item.urun_id || 0);
        const adet = Number(item.adet || 0);
        const birimFiyat = Number(item.birimFiyat || 0);

        if (!Number.isFinite(urunId) || urunId <= 0) {
          throw new Error(`Geçersiz urun_id: ${urunId}`);
        }

        await query(
          `INSERT INTO satis_fatura_detaylari
             (fatura_id, urun_id, adet, birim_fiyat)
           VALUES (?, ?, ?, ?)`,
          [faturaId, urunId, adet, birimFiyat]
        );

        // Stok düş
        await stokGuncelle(null, { urunId, satilanAdet: adet });
      }
    }

    revalidatePath("/faturaCikis");
    revalidatePath("/stok");
    return { success: true, faturaId };
  } catch (error) {
    console.error("Fatura kesme hatası:", error);
    throw error;
  }
}

// Fatura listesi (JOIN ile)
export async function getFaturalar() {
  try {
    return await query(`
      SELECT 
        sf.id,
        sf.tarih,
        m.unvan AS musteri,
        sfd.adet,
        sfd.birim_fiyat,
        u.urun_adi
      FROM satis_faturalar sf
      JOIN musteriler m ON sf.musteri_id = m.id
      JOIN satis_fatura_detaylari sfd ON sfd.fatura_id = sf.id
      JOIN urunler u ON sfd.urun_id = u.id
      ORDER BY sf.tarih DESC
    `);
  } catch (error) {
    console.error("Faturalar alınamadı:", error);
    return [];
  }
}