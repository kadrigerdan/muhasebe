'use server';
import { revalidatePath } from 'next/cache';
import {
    alisFaturaOlustur, alisFaturaSil, alisFaturaArsivle,
    alisFaturaGeriAl,
} from '@/models/alisFaturaModel';

export async function alisFaturaEkleAction(prevState, formData) {
    const cari_id = Number(formData.get('cari_id'));
    const tarih = formData.get('tarih');
    if (!cari_id || cari_id <= 0) return { error: 'Tedarikçi seçilmelidir.' };
    if (!tarih) return { error: 'Tarih zorunludur.' };

    let kalemler;
    try {
        kalemler = JSON.parse(formData.get('kalemler') || '[]');
    } catch {
        return { error: 'Kalemler okunamadı.' };
    }
    if (!Array.isArray(kalemler) || !kalemler.length) {
        return { error: 'En az bir kalem eklemelisiniz.' };
    }

    // Normalize + validate
    const normalizedKalemler = [];
    for (let i = 0; i < kalemler.length; i++) {
        const k = kalemler[i] ?? {};

        // Farklı isimlendirmeleri de kabul et (client uyumsuzluğuna karşı)
        const rawUrunId = k.urun_id ?? k.urunId ?? k.product_id ?? k.productId;
        const urun_id = Number(rawUrunId);
        const miktar = Number(k.miktar);
        const birim_fiyat = Number(k.birim_fiyat ?? k.birimFiyat ?? k.fiyat);

        if (!Number.isFinite(urun_id) || urun_id <= 0) {
            return { error: `${i + 1}. kalemde ürün seçilmemiş.` };
        }
        if (!Number.isFinite(miktar) || miktar <= 0) {
            return { error: `${i + 1}. kalemde miktar 0 olamaz.` };
        }
        if (!Number.isFinite(birim_fiyat) || birim_fiyat < 0) {
            return { error: `${i + 1}. kalemde fiyat geçersiz.` };
        }

        normalizedKalemler.push({ urun_id, miktar, birim_fiyat });
    }

    try {
        await alisFaturaOlustur({
            cari_id,
            tarih,
            kalemler: normalizedKalemler,
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

export async function alisFaturaOdemeAction(prevState, formData) {
    const fatura_id = Number(formData.get('fatura_id'));
    const tutar = Number(formData.get('tutar'));
    const tarih = formData.get('tarih');
    const kasadan_dus = formData.get('kasadan_dus') === 'on';
    const kasa_id = kasadan_dus ? Number(formData.get('kasa_id')) : null;

    if (!Number.isFinite(fatura_id) || fatura_id <= 0) {
        return { error: 'Fatura seçilmelidir.' };
    }
    if (!Number.isFinite(tutar) || tutar <= 0) {
        return { error: 'Tutar 0 olamaz.' };
    }
    if (!tarih) return { error: 'Tarih zorunludur.' };
    if (kasadan_dus && (!Number.isFinite(kasa_id) || kasa_id <= 0)) {
        return { error: 'Kasa seçilmelidir.' };
    }

    try {
        const { alisFaturaOdemeEkle } = await import('@/models/alisFaturaModel');
        await alisFaturaOdemeEkle(fatura_id, {
            tutar, tarih, kasadan_dus, kasa_id,
        });
        revalidatePath('/alis-faturalar');
        revalidatePath(`/alis-faturalar/${fatura_id}`);
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        revalidatePath('/cariler');
    } catch (err) {
        console.error('alisFaturaOdeme:', err);
        return { error: err.message || 'Ödeme kaydedilemedi.' };
    }
    return { ok: true };
}


