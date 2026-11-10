'use server';
import { revalidatePath } from 'next/cache';
import { uretimYap } from '@/models/uretimModel';

export async function uretimAction(prevState, formData) {
  const depo_id = Number(formData.get('depo_id'));
  const hammadde_id = Number(formData.get('hammadde_id'));
  const hammadde_miktar = Number(formData.get('hammadde_miktar'));
  const tarih = formData.get('tarih');
  const aciklama = formData.get('aciklama') || null;

  let mamuller;
  try {
    mamuller = JSON.parse(formData.get('mamuller') || '[]');
  } catch {
    return { error: 'Mamuller okunamadı.' };
  }

  if (!depo_id) return { error: 'Depo seçilmelidir.' };
  if (!hammadde_id) return { error: 'Hammadde seçilmelidir.' };
  if (!Number.isFinite(hammadde_miktar) || hammadde_miktar <= 0) return { error: 'Hammadde miktarı geçersiz.' };
  if (!tarih) return { error: 'Tarih zorunludur.' };
  if (!Array.isArray(mamuller) || mamuller.length === 0) return { error: 'En az bir mamul eklemelisiniz.' };

  const normalizedMamuller = mamuller.map(m => ({
    mamul_id: Number(m.mamul_id),
    miktar: Number(m.miktar)
  })).filter(m => m.mamul_id > 0 && m.miktar > 0);

  if (normalizedMamuller.length === 0) return { error: 'Geçerli mamul bulunamadı.' };

  try {
    await uretimYap({
      depo_id,
      hammadde_id,
      hammadde_miktar,
      mamuller: normalizedMamuller,
      tarih,
      aciklama,
    });
    revalidatePath('/depolar/uretim');
    revalidatePath('/depolar');
    revalidatePath('/stok');
    return { ok: true };
  } catch (err) {
    console.error('uretimAction:', err);
    return { error: err.message || 'Üretim kaydedilemedi.' };
  }
}