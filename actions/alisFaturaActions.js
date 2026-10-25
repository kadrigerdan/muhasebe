'use server';
import { revalidatePath } from 'next/cache';
import {
    alisFaturaOlustur, alisFaturaArsivle,
    alisFaturaGeriAl, alisIadeFaturaOlustur
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
    const normalize = [];
    for (let i = 0; i < kalemler.length; i++) {
        const k = kalemler[i] ?? {};
        const urun_id = Number(k.urun_id);
        const miktar = Number(k.miktar);        // ← miktar
        const birim_fiyat = Number(k.birim_fiyat);

        if (!Number.isFinite(urun_id) || urun_id <= 0) {
            return { error: `${i + 1}. kalemde ürün geçersiz.` };
        }
        if (!Number.isFinite(miktar) || miktar <= 0) {
            return { error: `${i + 1}. kalemde iade miktarı 0 olamaz.` };
        }
        if (!Number.isFinite(birim_fiyat) || birim_fiyat < 0) {
            return { error: `${i + 1}. kalemde fiyat geçersiz.` };
        }
        normalize.push({ urun_id, miktar, birim_fiyat });   // ← miktar
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

export async function alisIadeFaturaAction(prevState, formData) {
    const kaynak_fatura_id = Number(formData.get('kaynak_fatura_id'));
    const tarih = formData.get('tarih');

    if (!Number.isFinite(kaynak_fatura_id) || kaynak_fatura_id <= 0) {
        return { error: 'Kaynak fatura geçersiz.' };
    }
    if (!tarih) return { error: 'Tarih zorunludur.' };

    let kalemler;
    try {
        kalemler = JSON.parse(formData.get('kalemler') || '[]');
    } catch {
        return { error: 'Kalemler okunamadı.' };
    }
    if (!Array.isArray(kalemler) || !kalemler.length) {
        return { error: 'En az bir kalem iade edilmelidir.' };
    }

    const normalize = [];
    for (let i = 0; i < kalemler.length; i++) {
        const k = kalemler[i] ?? {};
        const urun_id = Number(k.urun_id);
        const miktar = Number(k.miktar);
        const birim_fiyat = Number(k.birim_fiyat);

        if (!Number.isFinite(urun_id) || urun_id <= 0) {
            return { error: `${i + 1}. kalemde ürün geçersiz.` };
        }
        if (!Number.isFinite(miktar) || miktar <= 0) {
            return { error: `${i + 1}. kalemde iade miktarı 0 olamaz.` };
        }
        if (!Number.isFinite(birim_fiyat) || birim_fiyat < 0) {
            return { error: `${i + 1}. kalemde fiyat geçersiz.` };
        }
        normalize.push({ urun_id, miktar, birim_fiyat });
    }

    try {
        const yeniId = await alisIadeFaturaOlustur({
            kaynak_fatura_id,
            tarih,
            kalemler: normalize,
        });
        revalidatePath('/alis-faturalar');
        revalidatePath(`/alis-faturalar/${kaynak_fatura_id}`);
        revalidatePath(`/alis-faturalar/${yeniId}`);
        revalidatePath('/stok');
        revalidatePath('/urunler');
        return { ok: true, iadeFaturaId: yeniId };
    } catch (err) {
        console.error('alisIadeFatura:', err);
        return { error: err.message || 'İade faturası kesilemedi.' };
    }
}


