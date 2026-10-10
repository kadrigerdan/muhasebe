'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { query } from '@/database/db';
import { oturumKaydet, oturumSil } from '@/lib/auth';

export async function girisAction(prevState, formData) {
  const kullanici_adi = formData.get('kullanici_adi')?.trim();
  const sifre = formData.get('sifre');
  const donus = formData.get('donus') || '/';

  if (!kullanici_adi) return { error: 'Kullanıcı adı zorunludur.' };
  if (!sifre) return { error: 'Şifre zorunludur.' };

  try {
    const rows = await query(
      'SELECT id, kullanici_adi, sifre_hash, ad_soyad, rol, aktif FROM kullanicilar WHERE kullanici_adi = ?',
      [kullanici_adi]
    );

    if (!rows.length) {
      return { error: 'Kullanıcı adı veya şifre hatalı.' };
    }

    const kullanici = rows[0];

    if (!kullanici.aktif) {
      return { error: 'Bu hesap devre dışı bırakılmış.' };
    }

    const dogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);
    if (!dogruMu) {
      return { error: 'Kullanıcı adı veya şifre hatalı.' };
    }

    await oturumKaydet({
      id: Number(kullanici.id),
      kullanici_adi: kullanici.kullanici_adi,
      ad_soyad: kullanici.ad_soyad,
      rol: kullanici.rol,
    });
  } catch (err) {
    console.error('girisAction:', err);
    return { error: 'Giriş yapılamadı.' };
  }

  redirect(donus);
}

export async function cikisAction() {
  await oturumSil();
  redirect('/giris');
}
