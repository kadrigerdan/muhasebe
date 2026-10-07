'use server';

import { revalidatePath } from 'next/cache';
import {
    urunOlustur, urunGuncelleDB, urunSilDB,
} from '@/models/urunModel';

function formVerisiniAl(formData) {
    return {
        urun_adi: formData.get('urun_adi')?.trim(),
        tip: formData.get('tip') || 'hammadde',
        kritik_seviye: Number(formData.get('kritik_seviye')) || 10,
        varsayilan_alis_fiyati: Number(formData.get('varsayilan_alis_fiyati')) || 0,
        varsayilan_satis_fiyati: Number(formData.get('varsayilan_satis_fiyati')) || 0,
        durum: formData.get('durum') === 'on' ? 1 : 0,
        stok: Number(formData.get('stok')) || 0,      // ← YENİ
    };
}

export async function urunEkleAction(prevState, formData) {
    const veri = formVerisiniAl(formData);
    if (!veri.urun_adi) return { error: 'Ürün adı zorunludur.' };

    try {
        await urunOlustur(veri);   // ← stok: 0 silindi, veri içindeki stok kullanılsın
        revalidatePath('/urunler');
        revalidatePath('/stok');
    } catch (err) {
        console.error('urunEkle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu isimde ürün zaten var.' };
        return { error: 'Ürün eklenemedi.' };
    }
    return { ok: true };
}

export async function urunGuncelleAction(id, prevState, formData) {
    const veri = formVerisiniAl(formData);
    if (!veri.urun_adi) return { error: 'Ürün adı zorunludur.' };

    try {
        const affected = await urunGuncelleDB(Number(id), veri);
        if (affected === 0) return { error: 'Ürün bulunamadı.' };
        revalidatePath('/urunler');
        revalidatePath('/stok');
        revalidatePath(`/urunler/${id}`);
    } catch (err) {
        console.error('urunGuncelle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu isimde başka bir ürün var.' };
        return { error: 'Ürün güncellenemedi.' };
    }
    return { ok: true };
}

export async function urunSilAction(id) {
    try {
        const affected = await urunSilDB(Number(id));
        if (affected === 0) return { error: 'Ürün bulunamadı.' };
        revalidatePath('/urunler');
        revalidatePath('/stok');
        return { ok: true };
    } catch (err) {
        console.error('urunSil:', err);
        if (err?.code === 'ER_ROW_IS_REFERENCED_2')
            return { error: 'Bu ürünün fatura/stok kaydı var, silinemez. Bunun yerine pasif yapın.' };
        return { error: 'Ürün silinemedi.' };
    }
}