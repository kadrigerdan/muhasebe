"use server"
import { getConnection, query } from "@/database/db";
import { revalidatePath } from "next/cache";


// Aktif ürünleri + stok durumunu getir
export async function getStokListesiAction() {
    try {
        const urunler = await query(
            `SELECT id, urun_adi, varsayilan_alis_fiyati, varsayilan_satis_fiyati,
              stok, kritik_seviye, durum
         FROM urunler  WHERE durum = 1    ORDER BY urun_adi ASC`
        );
        return { success: true, data: urunler }
    } catch (e) {
        console.error("getStokListesiAction:", e)
        return { success: false, message: e.message }
    }
}

// Tek ürünün hareket geçmişi
export async function getStokHareketleriAction(urunId) {
    try {
        const hareketler = await query(
            `SELECT id,tip,miktar,aciklama,kaynak,kaynak_id,tarih
            FROM stok_hareketleri 
            WHERE urun_id = ?
            ORDER BY tarih DESC, id DESC
            LIMIT 200`, [urunId]
        );
        return { success: true, data: hareketler };
    } catch (e) {
        console.error("getStokHarekerleriAction :", e);
        return { success: false, message: e.message };
    }
}

// Manuel stok giriş çıkış
export async function stokHareketEkleAction(prevState, formData) {
    const conn = await getConnection();
    try {
        const urun_id = Number(formData.get("urun_id"));
        const tip = formData.get("tip");
        const miktar = Math.abs(Number(formData.get("miktar")));
        const aciklama = formData.get("aciklama") || null;
        const tarih = formData.get("tarih");

        if (!urun_id || !miktar || !["giris", "cikis"].includes(tip)) {
            return { success: false, message: "Geçersiz veri" };
        }
        await conn.beginTransaction();

        await conn.query(
            `INSERT INTO stok_hareketleri
            (urun_id, tip, miktar, aciklama, kaynak, tarih)
            VALUES (?, ?, ?, ?, 'manuel', ?)`,
            [urun_id, tip, miktar, aciklama, tarih]
        );

        await conn.query(
            `UPDATE urunler SET stok = stok + ? WHERE id = ?`,
            [tip === "giris" ? miktar : -miktar, urun_id]


        );

        await conn.commit();
        revalidatePath("/stok");
        return { success: true, message: "Kaydedildi." };

    } catch (e) {
        await conn.rollback();
        console.error("stokHareketEkleAction:", e);
        return { success: false, message: e.message };
    } finally {
        conn.release();
    }

} 