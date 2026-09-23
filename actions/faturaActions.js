"use server";
import { revalidatePath } from "next/cache";
import { satisFaturasiKes } from "@/models/urunModel";

export async function faturaKes(prevState, formData) {
    try {
        const musteriIdRaw = formData.get("musteri_id");
        const tarih = formData.get("tarih");
        const urunlerStr = formData.get("urunler");

        const musteriId = Number(musteriIdRaw);

        if (!musteriId || !Number.isFinite(musteriId)) {
            return { success: false, error: "Lütfen müşteri seçin" };
        }

        if (!tarih) { return { success: false, error: "Tarih seçiniz" }; }

        let urunler = [];

        try { urunler = JSON.parse(urunlerStr || "[]"); }

        catch { return { success: false, error: "Ürün listesi okunamadı" }; }

        urunler = urunler.filter(u => u.urun_id && Number(u.urun_id) > 0);

        if (urunler.length === 0) {
            return { success: false, error: "En az bir ürün ekleyin" };
        }

        // 4. Model'i TEK SEFER çağır
        const fatura = await satisFaturasiKes({ musteri_id: musteriId, tarih, urunler, });

        revalidatePath("/faturalar");
        revalidatePath("/stok");

        return { success: true, message: "Fatura kesildi", fatura };

    } catch (error) {
        console.error("❌ Fatura kesme hatası:", error);
        return {
            success: false,
            error: error.message || "Fatura kesilirken bir hata oluştu"
        };
    }
}