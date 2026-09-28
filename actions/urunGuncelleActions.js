"use server"

import { query } from "@/database/db";
import { revalidatePath } from "next/cache";

export async function urunGuncelleAction(prevState, formData) {
    try {
        const id = Number(formData.get("id"));
        const urun_adi = formData.get("urun_adi");
        const varsayilan_alis_fiyati = parseFloat(formData.get("varsayilan_alis_fiyati") || 0);
        const varsayilan_satis_fiyati = parseFloat(formData.get("varsayilan_satis_fiyati") || 0);
        const kritik_seviye = Number(formData.get("kritik_seviye") || 10);

        if (!id || !urun_adi) {
            return { success: false, message: "Ürün adı ve ID zorunlu." };
        }

        await query(
            `UPDATE urunler
          SET urun_adi = ?,
              varsayilan_alis_fiyati = ?,
              varsayilan_satis_fiyati = ?,
              kritik_seviye = ?
        WHERE id = ?`,
            [urun_adi, varsayilan_alis_fiyati, varsayilan_satis_fiyati, kritik_seviye, id]);

        revalidatePath("/stok");
        revalidatePath("/fatura-kes");
        return { success: true, message: "Ürün güncellendi." };
    } catch (error) {
        console.error("urunGuncelleActions:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return { success: false, message: "Bu ürün adı zaten kayıtlı." };
        }
        return { success: false, message: error.message };

    }
}


export async function urunPasifeAlAction(prevState, formData) {
    try {
        const id = Number(formData.get("id"));
        if (!id) return { success: false, message: "ID zorunlu." };

        await query(`UPDATE urunler SET durum = 0 WHERE id = ?`, [id]);

        revalidatePath("/stok");
        revalidatePath("/fatura-kes");
        return { success: true, message: "Ürün pasife alındı." };
    } catch (e) {
        console.error("urunPasifeAlAction:", e);
        return { success: false, message: e.message };
    }
}
