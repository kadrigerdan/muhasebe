'use server';

import { revalidatePath } from 'next/cache';
import { getConnection } from '@/database/db';
import {
    personelOlustur,
    personelGuncelleDB,
    personelSilDB,
} from '@/models/personelModel';
import { hareketEkle } from '@/models/kasaModel';

function formVerisiniAl(formData) {
    return {
        ad: formData.get('ad')?.trim(),
        soyad: formData.get('soyad')?.trim(),
        tc_kimlik: formData.get('tc_kimlik')?.trim() || null,
        sgk_no: formData.get('sgk_no')?.trim() || null,
        telefon: formData.get('telefon')?.trim() || null,
        email: formData.get('email')?.trim() || null,
        adres: formData.get('adres')?.trim() || null,
        dogum_tarihi: formData.get('dogum_tarihi') || null,
        egitim_durumu: formData.get('egitim_durumu') || null,
        ehliyet_sinifi: formData.get('ehliyet_sinifi')?.trim() || null,
        ehliyet_tarihi: formData.get('ehliyet_tarihi') || null,
        ise_giris_tarihi: formData.get('ise_giris_tarihi'),
        isten_cikis_tarihi: formData.get('isten_cikis_tarihi') || null,
        gorev: formData.get('gorev')?.trim() || null,
        departman: formData.get('departman')?.trim() || null,
        maas: Number(formData.get('maas')) || 0,
        banka_adi: formData.get('banka_adi')?.trim() || null,
        iban: formData.get('iban')?.trim() || null,
        aktif: formData.get('aktif') === 'on' ? 1 : 0,
        notlar: formData.get('notlar')?.trim() || null,
    };
}

export async function personelEkleAction(prevState, formData) {
    const veri = formVerisiniAl(formData);

    if (!veri.ad) return { error: 'Ad zorunludur.' };
    if (!veri.soyad) return { error: 'Soyad zorunludur.' };
    if (!veri.ise_giris_tarihi) return { error: 'İşe giriş tarihi zorunludur.' };

    try {
        await personelOlustur(veri);
        revalidatePath('/personel');
    } catch (err) {
        console.error('personelEkle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu TC kimlik zaten kayıtlı.' };
        return { error: 'Personel eklenemedi.' };
    }
    return { ok: true };
}

export async function personelGuncelleAction(id, prevState, formData) {
    const veri = formVerisiniAl(formData);

    if (!veri.ad) return { error: 'Ad zorunludur.' };
    if (!veri.soyad) return { error: 'Soyad zorunludur.' };
    if (!veri.ise_giris_tarihi) return { error: 'İşe giriş tarihi zorunludur.' };

    try {
        const affected = await personelGuncelleDB(Number(id), veri);
        if (affected === 0) return { error: 'Personel bulunamadı.' };
        revalidatePath('/personel');
        revalidatePath(`/personel/${id}`);
    } catch (err) {
        console.error('personelGuncelle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu TC kimlik başka bir personelde kayıtlı.' };
        return { error: 'Personel güncellenemedi.' };
    }
    return { ok: true };
}

export async function personelSilAction(id) {
    try {
        const affected = await personelSilDB(Number(id));
        if (affected === 0) return { error: 'Personel bulunamadı.' };
        revalidatePath('/personel');
        return { ok: true };
    } catch (err) {
        console.error('personelSil:', err);
        if (err?.code === 'ER_ROW_IS_REFERENCED_2')
            return { error: 'Bu personelin ödeme kaydı var, silinemez.' };
        return { error: 'Personel silinemedi.' };
    }
}

export async function odemeEkleAction(prevState, formData) {
    const personel_id = Number(formData.get('personel_id'));
    const odeme_tipi = formData.get('odeme_tipi');
    const tutar = Number(formData.get('tutar'));
    const tarih = formData.get('tarih');
    const donem = formData.get('donem')?.trim() || null;
    const aciklama = formData.get('aciklama')?.trim() || null;
    const kasadan_dus = formData.get('kasadan_dus') === 'on';
    const kasa_id = kasadan_dus ? Number(formData.get('kasa_id')) : null;

    if (!personel_id) return { error: 'Personel seçilmelidir.' };
    if (!['maas', 'avans', 'prim', 'ikramiye', 'kesinti', 'diger'].includes(odeme_tipi))
        return { error: 'Geçersiz ödeme tipi.' };
    if (!tutar || tutar <= 0) return { error: 'Tutar 0 olamaz.' };
    if (!tarih) return { error: 'Tarih zorunludur.' };
    if (kasadan_dus && !kasa_id) return { error: 'Kasa seçilmelidir.' };

    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Kasa bakiye kontrolü (kasadan düşülüyorsa)
        if (kasadan_dus) {
            const [kasa] = await conn.query(
                'SELECT bakiye FROM kasa_bakiye_view WHERE id = ? FOR UPDATE',
                [kasa_id]
            );
            if (!kasa) throw new Error('Kasa bulunamadı.');
            if (Number(kasa.bakiye) < tutar) {
                throw new Error(
                    `Yetersiz kasa bakiyesi. Mevcut: ${Number(kasa.bakiye).toFixed(2)} ₺`
                );
            }
        }

        // Tek kayıt: personel_odeme
        await conn.query(
            `INSERT INTO personel_odeme
         (personel_id, odeme_tipi, tutar, tarih, donem, aciklama, kasadan_dus, kasa_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [personel_id, odeme_tipi, tutar, tarih, donem, aciklama,
                kasadan_dus ? 1 : 0, kasa_id]
        );

        await conn.commit();
        revalidatePath(`/personel/${personel_id}`);
        revalidatePath('/personel');
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        if (kasa_id) revalidatePath(`/kasa/${kasa_id}`);
    } catch (err) {
        await conn.rollback();
        console.error('odemeEkle:', err);
        return { error: err.message || 'Ödeme kaydedilemedi.' };
    } finally {
        conn.release();
    }
    return { ok: true };
}

export async function odemeSilAction(id, personelId) {
    try {
        const res = await query(
            'DELETE FROM personel_odeme WHERE id = ?',
            [Number(id)]
        );
        if (Number(res.affectedRows) === 0)
            return { error: 'Ödeme bulunamadı.' };

        revalidatePath(`/personel/${personelId}`);
        revalidatePath('/personel');
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        return { ok: true };
    } catch (err) {
        console.error('odemeSil:', err);
        return { error: 'Ödeme silinemedi.' };
    }
}