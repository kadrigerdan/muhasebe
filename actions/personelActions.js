'use server';

import { revalidatePath } from 'next/cache';
import { getConnection } from '@/database/db';
import { odemeEkle, odemeSilDB } from '@/models/personelModel';
import { hareketEkle } from '@/models/kasaModel';

// ... (diğer action'lar aynı) ...

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
    if (kasadan_dus && !kasa_id)
        return { error: 'Kasa seçilmelidir.' };

    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // 1) Personel ödeme kaydı
        const res = await conn.query(
            `INSERT INTO personel_odeme
         (personel_id, odeme_tipi, tutar, tarih, donem, aciklama, kasadan_dus)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [personel_id, odeme_tipi, tutar, tarih, donem, aciklama, kasadan_dus ? 1 : 0]
        );
        const odemeId = Number(res.insertId);

        // 2) Kasadan düş
        if (kasadan_dus) {
            const hareketId = await hareketEkle(conn, {
                kasa_id,
                tip: 'cikis',
                tutar,
                tarih,
                aciklama: `Personel ödemesi #${odemeId} (${odeme_tipi})`,
                kaynak_tipi: 'personel_odeme',
                kaynak_id: odemeId,
            });

            await conn.query(
                'UPDATE personel_odeme SET kasa_hareket_id = ? WHERE id = ?',
                [hareketId, odemeId]
            );
        }

        await conn.commit();
        revalidatePath(`/personel/${personel_id}`);
        revalidatePath('/personel');
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
    } catch (err) {
        await conn.rollback();
        console.error('odemeEkle:', err);
        return { error: 'Ödeme kaydedilemedi.' };
    } finally {
        conn.release();
    }
    return { ok: true };
}

export async function odemeSilAction(id, personelId) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        // Önce kasa hareketini sil (varsa)
        const [odeme] = await conn.query(
            'SELECT kasa_hareket_id FROM personel_odeme WHERE id = ?',
            [Number(id)]
        );
        if (odeme?.kasa_hareket_id) {
            await conn.query(
                'DELETE FROM kasa_hareketleri WHERE id = ?',
                [odeme.kasa_hareket_id]
            );
        }

        // Sonra ödemeyi sil
        const res = await conn.query(
            'DELETE FROM personel_odeme WHERE id = ?',
            [Number(id)]
        );

        await conn.commit();
        if (Number(res.affectedRows) === 0)
            return { error: 'Ödeme bulunamadı.' };

        revalidatePath(`/personel/${personelId}`);
        revalidatePath('/personel');
        revalidatePath('/kasa');
        revalidatePath('/kasa/hareketler');
        return { ok: true };
    } catch (err) {
        await conn.rollback();
        console.error('odemeSil:', err);
        return { error: 'Ödeme silinemedi.' };
    } finally {
        conn.release();
    }
}