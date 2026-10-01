'use server';
import { revalidatePath } from 'next/cache';
import { satisFaturaOlustur, satisFaturaSil } from '@/models/satisFaturaModel';

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

export async function satisFaturaSilAction(id) {
    try {
        const affected = await satisFaturaSil(Number(id));
        if (affected === 0) return { error: 'Fatura bulunamadı.' };
        revalidatePath('/satis-faturalar');
        revalidatePath('/urunler');
        revalidatePath('/stok');
        revalidatePath('/cariler');
        return { ok: true };
    } catch (err) {
        console.error('satisFaturaSil:', err);
        return { error: 'Fatura silinemedi.' };
    }
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