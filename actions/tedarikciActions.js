'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { tedarikciOlustur, tedarikciGuncelleDB, tedarikciSilDB, } from '@/models/tedarikciModel';


export async function tedarikciEkleAction(prevState, formData) {
    const unvan = formData.get('unvan')?.trim();
    const telefon = formData.get('telefon')?.trim() || null;
    const adres = formData.get('adres')?.trim() || null;

    if (!unvan) return { error: 'Ünvan zorunludur.' };
    try {
        await tedarikciOlustur({ unvan, telefon, adres });
        revalidatePath('/tedarikciler');
    } catch (err) {
        console.error('tedarikciEkle:', err);
        return { error: 'Kayıt eklenemedi.' };
    }
    return { ok: true }; ""
}


export async function tedarikciGuncelleAction(id, prevState, formData) {
    const unvan = formData.get('unvan')?.trim();
    const telefon = formData.get('telefon')?.trim() || null;
    const adres = formData.get('adres')?.trim() || null;

    if (!unvan) return { error: 'Ünvan zorunludur.' };
    try {
        const affected = await tedarikciGuncelleDB(Number(id), { unvan, telefon, adres });
        if (affected === 0) return { error: 'Kayıt bulunamadı.' };
        revalidatePath('/tedarikciler');
        revalidatePath(`/tedarikciler/${id}`);
    } catch (err) {
        console.error('tedarikciGuncelle:', err);
        return { error: 'Kayıt güncellenemedi.' };
    }

    redirect('/tedarikciler');
}


export async function tedarikciSilAction(id) {
    try {
        const affected = await tedarikciSilDB(Number(id));
        if (affected === 0) return { error: 'Kayıt bulunamadı.' };
        revalidatePath('/tedarikciler');
        return { ok: true };
    } catch (err) {
        console.error('tedarikciSil:', err);
        return { error: 'Kayıt silinemedi.' };
    }
}