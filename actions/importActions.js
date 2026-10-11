'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/database/db';

// ==================== ÜRÜN ŞABLONU ====================
export async function urunSablonAction() {
  try {
    const XLSX = await import('xlsx');
    const ornek = [
      {
        'Ürün Adı': 'Örnek Kalem',
        'Tip': 'hammadde',
        'Stok': 100,
        'Kritik Seviye': 10,
        'Alış Fiyatı': 5.0,
        'Satış Fiyatı': 10.0,
      },
      {
        'Ürün Adı': 'Örnek Defter',
        'Tip': 'satis_urunu',
        'Stok': 50,
        'Kritik Seviye': 5,
        'Alış Fiyatı': 20.0,
        'Satış Fiyatı': 40.0,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(ornek);
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 12 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return { ok: true, icerik: buf.toString('base64'), dosya: 'urun_sablonu.xlsx' };
  } catch (err) {
    console.error('urunSablon:', err);
    return { error: 'Şablon oluşturulamadı.' };
  }
}

// ==================== ÜRÜN IMPORT ====================
export async function urunImportAction(verilerJson) {
  let veriler;
  try {
    veriler = JSON.parse(verilerJson);
  } catch {
    return { error: 'Veri okunamadı.' };
  }

  if (!Array.isArray(veriler) || !veriler.length) {
    return { error: 'Yüklenecek veri yok.' };
  }

  const eklenenler = [];
  const hatalar = [];

  for (let i = 0; i < veriler.length; i++) {
    const satir = veriler[i];
    const sira = i + 2;

    const urun_adi = String(satir['Ürün Adı'] ?? '').trim();
    if (!urun_adi) {
      hatalar.push(`${sira}. satır: Ürün adı boş`);
      continue;
    }

    const tip = String(satir['Tip'] ?? 'hammadde').toLowerCase().trim();
    if (!['hammadde', 'satis_urunu'].includes(tip)) {
      hatalar.push(`${sira}. satır: Tip "${tip}" geçersiz (hammadde / satis_urunu)`);
      continue;
    }

    const stok = Number(satir['Stok']) || 0;
    const kritik = Number(satir['Kritik Seviye']) || 10;
    const alis = Number(satir['Alış Fiyatı']) || 0;
    const satis = Number(satir['Satış Fiyatı']) || 0;

    try {
      await query(
        `INSERT INTO urunler
           (urun_adi, tip, stok, kritik_seviye, varsayilan_alis_fiyati, varsayilan_satis_fiyati, durum)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [urun_adi, tip, stok, kritik, alis, satis]
      );
      eklenenler.push(urun_adi);
    } catch (err) {
      if (err?.code === 'ER_DUP_ENTRY') {
        hatalar.push(`${sira}. satır: "${urun_adi}" zaten kayıtlı`);
      } else {
        hatalar.push(`${sira}. satır: "${urun_adi}" eklenemedi`);
        console.error('urunImport:', err);
      }
    }
  }

  revalidatePath('/urunler');
  revalidatePath('/stok');

  return {
    ok: true,
    eklenen: eklenenler.length,
    hata: hatalar.length,
    hatalar: hatalar.slice(0, 20),
  };
}

// ==================== CARİ ŞABLONU ====================
export async function cariSablonAction() {
  try {
    const XLSX = await import('xlsx');
    const ornek = [
      {
        'Ünvan': 'Örnek Market',
        'Tip': 'musteri',
        'Telefon': '0212 555 55 55',
        'Adres': 'Örnek Mah. No:1',
        'Vergi No': '1234567890',
        'Vergi Dairesi': 'Kadıköy',
        'Yetkili': 'Ahmet Yılmaz',
        'E-posta': 'info@ornek.com',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(ornek);
    ws['!cols'] = [
      { wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 30 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cariler');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return { ok: true, icerik: buf.toString('base64'), dosya: 'cari_sablonu.xlsx' };
  } catch (err) {
    console.error('cariSablon:', err);
    return { error: 'Şablon oluşturulamadı.' };
  }
}

// ==================== CARİ IMPORT ====================
export async function cariImportAction(verilerJson) {
  let veriler;
  try {
    veriler = JSON.parse(verilerJson);
  } catch {
    return { error: 'Veri okunamadı.' };
  }

  if (!Array.isArray(veriler) || !veriler.length) {
    return { error: 'Yüklenecek veri yok.' };
  }

  const eklenenler = [];
  const hatalar = [];

  for (let i = 0; i < veriler.length; i++) {
    const satir = veriler[i];
    const sira = i + 2;

    const unvan = String(satir['Ünvan'] ?? '').trim();
    if (!unvan) {
      hatalar.push(`${sira}. satır: Ünvan boş`);
      continue;
    }

    const tip = String(satir['Tip'] ?? 'musteri').toLowerCase().trim();
    if (!['tedarikci', 'musteri', 'her_ikisi'].includes(tip)) {
      hatalar.push(`${sira}. satır: Tip "${tip}" geçersiz (tedarikci / musteri / her_ikisi)`);
      continue;
    }

    try {
      await query(
        `INSERT INTO cariler
           (unvan, tip, telefon, adres, vergi_no, vergi_dairesi, yetkili, email, aktif)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          unvan,
          tip,
          String(satir['Telefon'] ?? '').trim() || null,
          String(satir['Adres'] ?? '').trim() || null,
          String(satir['Vergi No'] ?? '').trim() || null,
          String(satir['Vergi Dairesi'] ?? '').trim() || null,
          String(satir['Yetkili'] ?? '').trim() || null,
          String(satir['E-posta'] ?? '').trim() || null,
        ]
      );
      eklenenler.push(unvan);
    } catch (err) {
      if (err?.code === 'ER_DUP_ENTRY') {
        hatalar.push(`${sira}. satır: "${unvan}" zaten kayıtlı`);
      } else {
        hatalar.push(`${sira}. satır: "${unvan}" eklenemedi`);
        console.error('cariImport:', err);
      }
    }
  }

  revalidatePath('/cariler');

  return {
    ok: true,
    eklenen: eklenenler.length,
    hata: hatalar.length,
    hatalar: hatalar.slice(0, 20),
  };
}
