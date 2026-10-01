'use server';

import { revalidatePath } from 'next/cache';
import { getConnection } from '@/database/db';
import {
    kasaOlustur, kasaGuncelleDB, kasaSilDB, hareketEkle,
} from '@/models/kasaModel';

// -------- KASA HESABI --------
export async function kasaEkleAction(prevState, formData) {
    const ad = formData.get('ad')?.trim();
    const tip = formData.get('tip') || 'nakit';
    const banka_adi = formData.get('banka_adi')?.trim() || null;
    const iban = formData.get('iban')?.trim() || null;
    const acilis_bakiye = Number(formData.get('acilis_bakiye')) || 0;

    if (!ad) return { error: 'Kasa adı zorunludur.' };
    if (!['nakit', 'banka', 'pos'].includes(tip))
        return { error: 'Geçersiz kasa tipi.' };

    try {
        await kasaOlustur({ ad, tip, banka_adi, iban, acilis_bakiye, aktif: 1 });
        revalidatePath('/kasa');
        revalidatePath('/kasa/hesaplar');
    } catch (err) {
        console.error('kasaEkle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu isimde kasa zaten var.' };
        return { error: 'Kasa eklenemedi.' };
    }
    return { ok: true };
}

export async function kasaGuncelleAction(id, prevState, formData) {
    const ad = formData.get('ad')?.trim();
    const tip = formData.get('tip') || 'nakit';
    const banka_adi = formData.get('banka_adi')?.trim() || null;
    const iban = formData.get('iban')?.trim() || null;
    const acilis_bakiye = Number(formData.get('acilis_bakiye')) || 0;
    const aktif = formData.get('aktif') === 'on' ? 1 : 0;

    if (!ad) return { error: 'Kasa adı zorunludur.' };

    try {
        const affected = await kasaGuncelleDB(Number(id), {
            ad, tip, banka_adi, iban, acilis_bakiye, aktif,
        });
        if (affected === 0) return { error: 'Kasa bulunamadı.' };
        revalidatePath('/kasa');
        revalidatePath('/kasa/hesaplar');
    } catch (err) {
        console.error('kasaGuncelle:', err);
        if (err?.code === 'ER_DUP_ENTRY')
            return { error: 'Bu isimde kasa zaten var.' };
        return { error: 'Kasa güncellenemedi.' };
    }
    return { ok: true };
}

export async function kasaSilAction(id) {
    try {
        const affected = await kasaSilDB(Number(id));
        if (affected === 0) return { error: 'Kasa bulunamadı.' };
        revalidatePath('/kasa');
        revalidatePath('/kasa/hesaplar');
        return { ok: true };
    } catch (err) {
        console.error('kasaSil:', err);
        if (err?.code === 'ER_ROW_IS_REFERENCED_2')
            return { error: 'Bu kasanın hareketi var, silinemez.' };
        return { error: 'Kasa silinemedi.' };
    }
}

// -------- HAREKET --------
export async function kasaHareketEkleAction(prevState, formData) {
    const kasa_id = Number(formData.get('kasa_id'));
    const tip = formData.get('tip');
    const tutar = Number(formData.get('tutar'));
    const tarih = formData.get('tarih');
    const aciklama = formData.get('aciklama')?.trim() || null;

    if (!kasa_id) return { error: 'Kasa seçilmelidir.' };
    if (!['giris', 'cikis'].includes(tip))
        return { error: 'Geçersiz hareket tipi.' };
    if (!tutar || tutar <= 0) return { error: 'Tutar 0 olamaz.' };
    if (!tarih) return { error: 'Tarih zorunludur.' };

    const conn = await getConnection();
    try {
        await conn.beginTransaction();
        await hareketEkle(conn, {
            kasa_id, tip, tutar, tarih, aciklama, kaynak_tipi: 'diger',
        });
        await conn.commit();
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
    } catch (err) {
        await conn.rollback();
        console.error('kasaHareketEkle:', err);
        return { error: 'Hareket kaydedilemedi.' };
    } finally {
        conn.release();
    }
    return { ok: true };
}

export async function kasaHareketSilAction(id) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();
        const res = await conn.query(
            'DELETE FROM kasa_hareketleri WHERE id = ?',
            [Number(id)]
        );
        await conn.commit();
        if (Number(res.affectedRows) === 0)
            return { error: 'Hareket bulunamadı.' };
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        return { ok: true };
    } catch (err) {
        await conn.rollback();
        console.error('kasaHareketSil:', err);
        return { error: 'Hareket silinemedi.' };
    } finally {
        conn.release();
    }
}