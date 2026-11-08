'use server';
import { revalidatePath } from 'next/cache';
import { stokTransferEt } from '@/models/transferModel';

export async function stokTransferAction(prevState, formData) {
  const gonderen_depo_id = Number(formData.get('gonderen_depo_id'));
  const alan_depo_id = Number(formData.get('alan_depo_id'));
  const urun_id = Number(formData.get('urun_id'));
  const miktar = Number(formData.get('miktar'));
  const tarih = formData.get('tarih');
  const aciklama = formData.get('aciklama') || null;

  if (!gonderen_depo_id) return { error: 'Gönderen depo seçilmelidir.' };
  if (!alan_depo_id) return { error: 'Alan depo seçilmelidir.' };
  if (gonderen_depo_id === alan_depo_id) {
    return { error: 'Gönderen ve alan depo aynı olamaz.' };
  }
  if (!urun_id) return { error: 'Ürün seçilmelidir.' };
  if (!Number.isFinite(miktar) || miktar <= 0) {
    return { error: 'Miktar 0 olamaz.' };
  }
  if (!tarih) return { error: 'Tarih zorunludur.' };

  try {
    await stokTransferEt({
      gonderen_depo_id,
      alan_depo_id,
      urun_id,
      miktar,
      tarih,
      aciklama,
    });
    revalidatePath('/depolar/virman');
    revalidatePath('/stok');
    return { ok: true };
  } catch (err) {
    console.error('stokTransfer:', err);
    return { error: err.message || 'Transfer başarısız.' };
  }
}