"use server"
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function urunEkleActions(prevState, formData) {
	try {
		const urunAdi = formData.get("urun_adi");
		const alisFiyati = parseFloat(formData.get("varsayilan_alis_fiyati")) || 0;
		const satisFiyati = parseFloat(formData.get("varsayilan_satis_fiyati")) || 0;

		if (!urunAdi) {
			return { success: false, message: "Ürün adı zorunludur." }
		}

		// 1.Ürünü veritabanına ekleyin.
		const result = await query(
			`INSERT INTO urunler (urunAdi,alisFiyati,satisFiyati) VALUES (?,?,?)`,
			[urunAdi, alisFiyati, satisFiyati]
		);

		// Eklenen yeni ürünün ID sini alıp nesne oluştur
		const yeniUrun = {
			id: result.InsertId, urunAdi, alisFiyati, satisFiyati,
			fiyat: satisFiyati
		};

		revalidatePath("/stok");
		revalidatePath("/fatura-kes");

		return {
			success: true, message: "Ürün başarıyla eklendi.", data: yeniUrun
		};
	} catch (error) {
		console.error("Ürün ekleme hatası:", error)
		return { success: false, message: "Ürün eklenirken bir hata oluştu." + error.message };
	}
}