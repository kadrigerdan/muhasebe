'use server';

import { revalidatePath } from 'next/cache';
import { ayarlariGuncelle } from '@/models/ayarlarModel';

export async function ayarlarKaydetAction(prevState, formData) {
  const sirket_adi = formData.get('sirket_adi')?.trim();
  if (!sirket_adi) return { error: 'Şirket adı zorunludur.' };

  const veri = {
    sirket_adi,
    adres: formData.get('adres')?.trim() || null,
    telefon: formData.get('telefon')?.trim() || null,
    email: formData.get('email')?.trim() || null,
    vergi_no: formData.get('vergi_no')?.trim() || null,
    vergi_dairesi: formData.get('vergi_dairesi')?.trim() || null,
    fatura_alt_not: formData.get('fatura_alt_not')?.trim() || null,
    fis_alt_not: formData.get('fis_alt_not')?.trim() || null,
    logo_url: formData.get('logo_url')?.trim() || null,
  };

  try {
    await ayarlariGuncelle(veri);
    // Tüm fiş/fatura sayfalarını yenile
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('ayarlarKaydet:', err);
    return { error: 'Ayarlar kaydedilemedi.' };
  }
  return { ok: true };
}
