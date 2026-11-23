"use server"
import { getConnection, query } from "@/database/db";
import { revalidatePath } from "next/cache";


// Depoları getir
export async function getDepolarAction() {
    try {
        const depolar = await query(
            'SELECT id, ad FROM depolar ORDER BY id'
        );
        return { success: true, data: depolar }
    } catch (e) {
        console.error("getDepolarAction:", e);
        return { success: false, message: e.message };
    }
}


// Aktif ürünleri + DEPO bazlı stok durumununa getir
export async function getStokListesiAction() {
    try {
        const urunler = await query(
            `SELECT id, urun_adi, tip, varsayilan_alis_fiyati, varsayilan_satis_fiyati,
       kritik_seviye, durum
  FROM urunler WHERE durum = 1 ORDER BY urun_adi ASC`
        );

        // Depo bazlı stokları çek
        const stoklar = await query(
            `SELECT us.urun_id, d.ad AS depo_adi, us.stok
            FROM urun_stok us 
            JOIN depolar d ON d.id = us.depo_id
            WHERE us.stok > 0
            ORDER BY d.id 
            `
        );

        //Ürün bazlı stok haritası
        const stokMap = {};
        for (const s of stoklar) {
            if (!stokMap[s.urun_id]) stokMap[s.urun_id] = [];
            stokMap[s.urun_id].push({
                depo: s.depo_adi,
                stok: Number(s.stok),
            });
        }

        // Ürünlere depo stoklarını ekle
        const data = urunler.map((u) => {
            const depoListesi = stokMap[u.id] || [];
            return {
                ...u,
                depolar: depoListesi,
                // Eski uyumluluk için toplam stok
                stok: depoListesi.reduce((sum, d) => sum + d.stok, 0),
            };
        });

        return { success: true, data }
    } catch (e) {
        console.error("getStokListesiAction:", e)
        return { success: false, message: e.message }
    }
}

// Tek ürünün hareket geçmişi
export async function getStokHareketleriAction(urunId) {
    try {
        const hareketler = await query(
            `SELECT sh.id,sh.tip,sh.miktar,sh.aciklama,sh.kaynak,sh.kaynak_id,sh.tarih,
            d.ad AS depo_adi
            FROM stok_hareketleri sh
            LEFT JOIN depolar d ON d.id = sh.depo_id 
            WHERE sh.urun_id = ?
            ORDER BY sh.tarih DESC, sh.id DESC
            LIMIT 200`, [urunId]
        );
        return { success: true, data: hareketler };
    } catch (e) {
        console.error("getStokHarekerleriAction :", e);
        return { success: false, message: e.message };
    }
}

// Manuel stok giriş çıkış (Depo seçimi ile)
export async function stokHareketEkleAction(prevState, formData) {
    const conn = await getConnection();
    try {
        const urun_id = Number(formData.get("urun_id"));
        const depo_id = Number(formData.get("depo_id"))
        const tip = formData.get("tip");
        const miktar = Math.abs(Number(formData.get("miktar")));
        const aciklama = formData.get("aciklama") || null;
        const tarih = formData.get("tarih");

        if (!urun_id || !depo_id || !miktar || !["giris", "cikis"].includes(tip)) {
            return { success: false, message: "Geçersiz veri(depo ve miktar zorunlu)" };
        }
        await conn.beginTransaction();

        // Stok kontrolü çıkış ise
        if (tip === "cikis") {
            const stokRows = await conn.query(
                `SELECT stok FROM urun_stok WHERE urun_id = ? AND depo_id ? FOR UPDATE`,
                [urun_id, depo_id]
            );
            const mevcut = Number(stokRows[0]?.stok ?? 0);
            if (mevcut < miktar) {
                await conn.rollback();
                return { success: false, message: `Yetersiz stok (mevcut:${mevcut})` };
            }
        }

        // Hareket kaydı
        await conn.query(
            `INSERT INTO stok_hareketleri
            (urun_id, depo_id, tip, miktar, aciklama, kaynak, tarih)
            VALUES (?, ?, ?, ?,?, 'manuel', ?)`,
            [urun_id, depo_id, tip, miktar, aciklama, tarih]
        );

        // Depo stoğunu güncelle
        if (tip === "giris") {
            await conn.query(
                `INSERT INTO urun_stok (urun_id, depo_id, stok)
                VALUES (?,?,?)
                ON DUPLICATE KEY  UPDATE stok = stok + VALUES(stok)`,
                [urun_id, depo_id, miktar]
            );
        } else {
            await conn.query(
                `UPDATE urun_stok SET stok = stok - ?
                WHERE urun_id = ? AND depo_id = ?`,
                [miktar, urun_id, depo_id]
            );
        }


        await conn.commit();
        revalidatePath("/stok");
        revalidatePath("/depolar");
        return { success: true, message: "Kaydedildi." };

    } catch (e) {
        await conn.rollback();
        console.error("stokHareketEkleAction:", e);
        return { success: false, message: e.message };
    } finally {
        conn.release();
    }

} 