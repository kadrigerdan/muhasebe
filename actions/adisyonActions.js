'use server';

import { revalidatePath } from 'next/cache';
import {
    masaAcikAdisyon,
    adisyonAc,
    adisyonKalemEkle,
    adisyonKalemSil,
    adisyonKapat,
    mutfakDurumGuncelle,
} from '@/models/adisyonModel';

// Masa aç (adisyon yoksa oluştur, varsa mevcut ID'yi döndür)
export async function masaAcAction(masaId) {
    try {
        const mevcut = await masaAcikAdisyon(Number(masaId));
        if (mevcut) {
            return { ok: true, adisyon_id: Number(mevcut.id) };
        }
        const yeniId = await adisyonAc(Number(masaId));
        revalidatePath('/restoran');
        return { ok: true, adisyon_id: yeniId };
    } catch (err) {
        console.error('masaAc:', err);
        return { error: 'Masa açılamadı.' };
    }
}

// Adisyona ürün ekle
export async function adisyonKalemEkleAction(adisyonId, urunId, adet = 1) {
    if (!adisyonId || !urunId) return { error: 'Eksik bilgi.' };
    if (Number(adet) <= 0) return { error: 'Adet 0 olamaz.' };

    try {
        await adisyonKalemEkle(Number(adisyonId), Number(urunId), Number(adet));
        revalidatePath(`/restoran/${adisyonId}`);
        revalidatePath('/restoran');
        revalidatePath('/mutfak');
        return { ok: true };
    } catch (err) {
        console.error('adisyonKalemEkle:', err);
        return { error: err.message || 'Ürün eklenemedi.' };
    }
}

// Kalem sil
export async function adisyonKalemSilAction(kalemId, adisyonId) {
    try {
        await adisyonKalemSil(Number(kalemId));
        revalidatePath(`/restoran/${adisyonId}`);
        revalidatePath('/restoran');
        revalidatePath('/mutfak');
        return { ok: true };
    } catch (err) {
        console.error('adisyonKalemSil:', err);
        return { error: 'Ürün silinemedi.' };
    }
}

// Ödeme al (adisonu kapat)
export async function adisyonKapatAction(prevState, formData) {
    const adisyon_id = Number(formData.get('adisyon_id'));
    const kasa_id = Number(formData.get('kasa_id')) || null;
    const odeme_yontemi = formData.get('odeme_yontemi')?.trim() || 'nakit';

    if (!adisyon_id) return { error: 'Adisyon seçilmelidir.' };
    if (!kasa_id) return { error: 'Kasa seçilmelidir.' };
    if (!['nakit', 'kredi_karti', 'pos', 'iban'].includes(odeme_yontemi)) {
        return { error: 'Geçersiz ödeme yöntemi.' };
    }

    try {
        const res = await adisyonKapat(adisyon_id, kasa_id, odeme_yontemi);
        revalidatePath('/restoran');
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        revalidatePath('/stok');
        revalidatePath('/urunler');
        return { ok: true, toplam: res.toplam };
    } catch (err) {
        console.error('adisyonKapat:', err);
        return { error: err.message || 'Adisyon kapatılamadı.' };
    }
}

// Mutfak durum güncelle
export async function mutfakDurumAction(kalemId, yeniDurum) {
    if (!['bekliyor', 'hazir', 'servis'].includes(yeniDurum)) {
        return { error: 'Geçersiz durum.' };
    }
    try {
        await mutfakDurumGuncelle(Number(kalemId), yeniDurum);
        revalidatePath('/mutfak');
        revalidatePath('/restoran');
        return { ok: true };
    } catch (err) {
        console.error('mutfakDurum:', err);
        return { error: 'Durum güncellenemedi.' };
    }
}