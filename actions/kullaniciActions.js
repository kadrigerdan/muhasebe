'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import {
  kullaniciOlustur,
  kullaniciGuncelleDB,
  sifreGuncelle,
} from '@/models/kullaniciModel';
import { oturumAl } from '@/lib/auth';

async function adminMi() {
  const oturum = await oturumAl();
  if (!oturum || oturum.rol !== 'admin') return false;
  return true;
}

export async function kullaniciEkleAction(prevState, formData) {
  if (!(await adminMi())) return { error: 'Yetkiniz yok.' };

  const kullanici_adi = formData.get('kullanici_adi')?.trim();
  const ad_soyad = formData.get('ad_soyad')?.trim();
  const sifre = formData.get('sifre');
  const rol = formData.get('rol') || 'personel';

  if (!kullanici_adi) return { error: 'Kullanıcı adı zorunludur.' };
  if (!ad_soyad) return { error: 'Ad soyad zorunludur.' };
  if (!sifre || sifre.length < 4) return { error: 'Şifre en az 4 karakter olmalı.' };
  if (!['admin', 'personel'].includes(rol)) return { error: 'Geçersiz rol.' };

  try {
    const hash = await bcrypt.hash(sifre, 10);
    await kullaniciOlustur({
      kullanici_adi,
      sifre_hash: hash,
      ad_soyad,
      rol,
      aktif: 1,
    });
    revalidatePath('/kullanicilar');
  } catch (err) {
    console.error('kullaniciEkle:', err);
    if (err?.code === 'ER_DUP_ENTRY')
      return { error: 'Bu kullanıcı adı zaten var.' };
    return { error: 'Kullanıcı eklenemedi.' };
  }
  return { ok: true };
}

export async function kullaniciGuncelleAction(id, prevState, formData) {
  if (!(await adminMi())) return { error: 'Yetkiniz yok.' };

  const kullanici_adi = formData.get('kullanici_adi')?.trim();
  const ad_soyad = formData.get('ad_soyad')?.trim();
  const rol = formData.get('rol') || 'personel';
  const aktif = formData.get('aktif') === 'on' ? 1 : 0;
  const yeni_sifre = formData.get('yeni_sifre');

  if (!kullanici_adi) return { error: 'Kullanıcı adı zorunludur.' };
  if (!ad_soyad) return { error: 'Ad soyad zorunludur.' };

  try {
    await kullaniciGuncelleDB(Number(id), {
      kullanici_adi,
      ad_soyad,
      rol,
      aktif,
    });

    if (yeni_sifre && yeni_sifre.length >= 4) {
      const hash = await bcrypt.hash(yeni_sifre, 10);
      await sifreGuncelle(Number(id), hash);
    }

    revalidatePath('/kullanicilar');
  } catch (err) {
    console.error('kullaniciGuncelle:', err);
    if (err?.code === 'ER_DUP_ENTRY')
      return { error: 'Bu kullanıcı adı zaten var.' };
    return { error: 'Kullanıcı güncellenemedi.' };
  }
  return { ok: true };
}
