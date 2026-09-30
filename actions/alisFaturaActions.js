'use server';
import { revalidatePath } from 'next/cache';
import { alisFaturaOlustur, alisFaturaSil } from '@/models/alisFaturaModel';

export async function alisFaturaEkleAction(prevState, formData) {
    const cari_id = Number(formData.get('cari_id'));
    const tarih = formData.get('tarih');
    if (!cari_id) return { error: 'Tedarikçi seçilmelidir.' };
    if (!tarih) return { error: 'Tarih zorunludur.' };

    let kalemler;
    try {
        kalemler = JSON.parse(formData.get('kalemler') || '[]');
    } catch {
        return { error: 'Kalemler okunamadı.' };
    }
    if (!kalemler.length) return { error: 'En az bir kalem eklemelisiniz.' };

    for (const k of kalemler) {
        if (!k.urun_id) return { error: 'Kalemlerde ürün seçilmemiş.' };
        if (Number(k.miktar) <= 0) return { error: 'Miktar 0 olamaz.' };
        if (Number(k.birim_fiyat) < 0) return { error: 'Fiyat negatif olamaz.' };
    }

    try {
        await alisFaturaOlustur({
            cari_id, tarih,
            kalemler: kalemler.map((k) => ({
                urun_id: Number(k.urun_id),
                miktar: Number(k.miktar),
                birim_fiyat: Number(k.birim_fiyat),
            })),
        });
        revalidatePath('/alis-faturalar');
        revalidatePath('/urunler');
        revalidatePath('/stok');
        revalidatePath('/cariler');
    } catch (err) {
        console.error('alisFaturaEkle:', err);
        return { error: 'Fatura kaydedilemedi.' };
    }
    return { ok: true };
}

export async function alisFaturaSilAction(id) {
    try {
        const affected = await alisFaturaSil(Number(id));
        if (affected === 0) return { error: 'Fatura bulunamadı.' };
        revalidatePath('/alis-faturalar');
        revalidatePath('/urunler');
        revalidatePath('/stok');
        revalidatePath('/cariler');
        return { ok: true };
    } catch (err) {
        console.error('alisFaturaSil:', err);
        return { error: 'Fatura silinemedi.' };
    }
}