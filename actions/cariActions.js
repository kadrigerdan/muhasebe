'use server';
import { revalidatePath } from 'next/cache';
import { cariOlustur, cariGuncelleDB, cariSilDB } from '@/models/cariModel';

export async function cariEkleAction(prevState, formData) {
    const unvan = formData.get('unvan')?.trim();
    if (!unvan) return { error: 'Ünvan zorunludur.' };

    const veri = {
        unvan,
        tip: formData.get('tip') || 'her_ikisi',
        telefon: formData.get('telefon')?.trim() || null,
        adres: formData.get('adres')?.trim() || null,
        vergi_no: formData.get('vergi_no')?.trim() || null,
        vergi_dairesi: formData.get('vergi_dairesi')?.trim() || null,
        yetkili: formData.get('yetkili')?.trim() || null,
        email: formData.get('email')?.trim() || null,
        aktif: 1,
    };

    try {
        await cariOlustur(veri);
        revalidatePath('/cariler');
    } catch (err) {
        console.error('cariEkle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu ünvan zaten kayıtlı.' };
        return { error: 'Cari eklenemedi.' };
    }
    return { ok: true };
}

export async function cariGuncelleAction(id, prevState, formData) {
    const unvan = formData.get('unvan')?.trim();
    if (!unvan) return { error: 'Ünvan zorunludur.' };

    const veri = {
        unvan,
        tip: formData.get('tip') || 'her_ikisi',
        telefon: formData.get('telefon')?.trim() || null,
        adres: formData.get('adres')?.trim() || null,
        vergi_no: formData.get('vergi_no')?.trim() || null,
        vergi_dairesi: formData.get('vergi_dairesi')?.trim() || null,
        yetkili: formData.get('yetkili')?.trim() || null,
        email: formData.get('email')?.trim() || null,
        aktif: 1,
    };

    try {
        const affected = await cariGuncelleDB(Number(id), veri);
        if (affected === 0) return { error: 'Cari bulunamadı.' };
        revalidatePath('/cariler');
        revalidatePath(`/cariler/${id}`);
    } catch (err) {
        console.error('cariGuncelle:', err);
        return { error: 'Cari güncellenemedi.' };
    }
    return { ok: true };
}

export async function cariSilAction(id) {
    try {
        const affected = await cariSilDB(Number(id));
        if (affected === 0) return { error: 'Cari bulunamadı.' };
        revalidatePath('/cariler');
        return { ok: true };
    } catch (err) {
        console.error('cariSil:', err);
        if (err?.code === 'ER_ROW_IS_REFERENCED_2')
            return { error: 'Bu cariye ait fatura var, silinemez.' };
        return { error: 'Cari silinemedi.' };
    }
}