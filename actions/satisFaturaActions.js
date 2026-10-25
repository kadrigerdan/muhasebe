'use server';
import { revalidatePath } from 'next/cache';
import { satisFaturaOlustur, satisFaturaSil, satisIadeFaturaOlustur } from '@/models/satisFaturaModel';
import { satisFaturaArsivle } from "@/models/satisFaturaModel"

export async function satisFaturaEkleAction(prevState, formData) {
    const cari_id = Number(formData.get('cari_id'));
    const tarih = formData.get('tarih');
    if (!cari_id) return { error: 'Müşteri seçilmelidir.' };
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
        if (Number(k.adet) <= 0) return { error: 'Adet 0 olamaz.' };
        if (Number(k.birim_fiyat) < 0) return { error: 'Fiyat negatif olamaz.' };
    }

    try {
        await satisFaturaOlustur({
            cari_id, tarih,
            kalemler: kalemler.map((k) => ({
                urun_id: Number(k.urun_id),
                adet: Number(k.adet),
                birim_fiyat: Number(k.birim_fiyat),
            })),
        });
        revalidatePath('/satis-faturalar');
        revalidatePath('/urunler');
        revalidatePath('/stok');
        revalidatePath('/cariler');
    } catch (err) {
        console.error('satisFaturaEkle:', err);
        if (err?.message?.startsWith('Yetersiz stok'))
            return { error: err.message };
        return { error: 'Fatura kaydedilemedi.' };
    }
    return { ok: true };
}

export async function satisFaturaTahsilatAction(prevState, formData) {
    const fatura_id = Number(formData.get('fatura_id'));
    const tutar = Number(formData.get('tutar'));
    const tarih = formData.get('tarih');
    const kasaya_yatir = formData.get('kasaya_yatir') === 'on';
    const kasa_id = kasaya_yatir ? Number(formData.get('kasa_id')) : null;

    if (!fatura_id) return { error: 'Fatura seçilmelidir.' };
    if (!tutar || tutar <= 0) return { error: 'Tutar 0 olamaz.' };
    if (!tarih) return { error: 'Tarih zorunludur.' };
    if (kasaya_yatir && !kasa_id) return { error: 'Kasa seçilmelidir.' };

    try {
        const { satisFaturaTahsilatEkle } = await import('@/models/satisFaturaModel');
        await satisFaturaTahsilatEkle(fatura_id, {
            tutar, tarih, kasaya_yatir, kasa_id,
        });
        revalidatePath('/satis-faturalar');
        revalidatePath(`/satis-faturalar/${fatura_id}`);
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        revalidatePath('/cariler');
    } catch (err) {
        console.error('satisFaturaTahsilat:', err);
        return { error: err.message || 'Tahsilat kaydedilemedi.' };
    }
    return { ok: true };
}

export async function satisFaturaArsivleAction(id, neden = null) {
    const faturaId = Number(id);
    if (!Number.isFinite(faturaId) || faturaId <= 0) {
        return { error: 'Geçersiz fatura.' };
    }

    try {
        const affected = await satisFaturaArsivle(faturaId, { neden });
        if (affected === 0) {
            return { error: 'Fatura bulunamadı veya zaten arşivlenmiş.' };
        }
        revalidatePath('/satis-faturalar');
        revalidatePath(`/satis-faturalar/${faturaId}`);
        revalidatePath('/stok');
        revalidatePath('/cariler');
        revalidatePath('/kasa');
        return { ok: true };
    } catch (err) {
        console.error('satisFaturaArsivle:', err);
        return { error: err.message || 'Fatura arşivlenemedi.' };
    }
}

export async function satisIadeFaturaAction(prevState, formData) {
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
        const adet = Number(k.adet);
        const birim_fiyat = Number(k.birim_fiyat);

        if (!Number.isFinite(urun_id) || urun_id <= 0) {
            return { error: `${i + 1}. kalemde ürün geçersiz.` };
        }
        if (!Number.isFinite(adet) || adet <= 0) {
            return { error: `${i + 1}. kalemde iade miktarı 0 olamaz.` };
        }
        if (!Number.isFinite(birim_fiyat) || birim_fiyat < 0) {
            return { error: `${i + 1}. kalemde fiyat geçersiz.` };
        }
        normalize.push({ urun_id, adet, birim_fiyat });
    }

    try {
        const yeniId = await satisIadeFaturaOlustur({
            kaynak_fatura_id,
            tarih,
            kalemler: normalize,
        });
        revalidatePath('/satis-faturalar');
        revalidatePath(`/satis-faturalar/${kaynak_fatura_id}`);
        revalidatePath(`/satis-faturalar/${yeniId}`);
        revalidatePath('/stok');
        revalidatePath('/urunler');
        return { ok: true, iadeFaturaId: yeniId };
    } catch (err) {
        console.error('satisIadeFatura:', err);
        return { error: err.message || 'İade faturası kesilemedi.' };
    }
}