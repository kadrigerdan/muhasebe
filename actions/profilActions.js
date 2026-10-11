'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { query } from '@/database/db';
import { oturumAl } from '@/lib/auth';
import { sifreGuncelle } from '@/models/kullaniciModel';

export async function sifreDegistirAction(prevState, formData) {
  const oturum = await oturumAl();
  if (!oturum) return { error: 'Giriş yapmalısınız.' };

  const mevcut_sifre = formData.get('mevcut_sifre');
  const yeni_sifre = formData.get('yeni_sifre');
  const yeni_sifre_tekrar = formData.get('yeni_sifre_tekrar');

  if (!mevcut_sifre) return { error: 'Mevcut şifre zorunludur.' };
  if (!yeni_sifre || yeni_sifre.length < 4)
    return { error: 'Yeni şifre en az 4 karakter olmalı.' };
  if (yeni_sifre !== yeni_sifre_tekrar)
    return { error: 'Yeni şifreler uyuşmuyor.' };

  try {
    const rows = await query(
      'SELECT sifre_hash FROM kullanicilar WHERE id = ?',
      [oturum.id]
    );
    if (!rows.length) return { error: 'Kullanıcı bulunamadı.' };

    const dogru = await bcrypt.compare(mevcut_sifre, rows[0].sifre_hash);
    if (!dogru) return { error: 'Mevcut şifre hatalı.' };

    const hash = await bcrypt.hash(yeni_sifre, 10);
    await sifreGuncelle(oturum.id, hash);

    revalidatePath('/profil');
  } catch (err) {
    console.error('sifreDegistir:', err);
    return { error: 'Şifre değiştirilemedi.' };
  }
  return { ok: true };
}
