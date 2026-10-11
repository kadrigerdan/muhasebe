'use server';

import { query } from '@/database/db';
import { excelOlustur, tarihStr } from '@/lib/excel';

// ==================== SATIŞ FATURALARI ====================
export async function satisFaturalariExcelAction() {
  try {
    const rows = await query(
      `SELECT f.id, f.tarih, c.unvan AS cari,
              COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam,
              f.odenen_tutar, f.durum
         FROM satis_faturalar f
         JOIN cariler c ON c.id = f.cari_id
         LEFT JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
        GROUP BY f.id, f.tarih, c.unvan, f.odenen_tutar, f.durum
        ORDER BY f.tarih DESC, f.id DESC`
    );

    const veri = rows.map((f) => {
      const toplam = Number(f.toplam);
      const odenen = Number(f.odenen_tutar || 0);
      return {
        'Fatura No': Number(f.id),
        'Tarih': new Date(f.tarih).toLocaleDateString('tr-TR'),
        'Müşteri': f.cari,
        'Toplam (₺)': toplam,
        'Tahsil (₺)': odenen,
        'Kalan (₺)': toplam - odenen,
        'Durum':
          f.durum === 'odendi'
            ? 'Ödendi'
            : f.durum === 'kismi'
            ? 'Kısmi'
            : 'Ödenmedi',
      };
    });

    const icerik = await excelOlustur(veri, 'Satış Faturaları');
    return {
      ok: true,
      icerik,
      dosya: `satis_faturalari_${tarihStr()}.xlsx`,
    };
  } catch (err) {
    console.error('satisFaturalariExcel:', err);
    return { error: 'Excel oluşturulamadı.' };
  }
}

// ==================== ALIŞ FATURALARI ====================
export async function alisFaturalariExcelAction() {
  try {
    const rows = await query(
      `SELECT f.id, f.tarih, c.unvan AS cari,
              COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam,
              f.odenen_tutar, f.durum
         FROM alis_faturalar f
         JOIN cariler c ON c.id = f.cari_id
         LEFT JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
        GROUP BY f.id, f.tarih, c.unvan, f.odenen_tutar, f.durum
        ORDER BY f.tarih DESC, f.id DESC`
    );

    const veri = rows.map((f) => {
      const toplam = Number(f.toplam);
      const odenen = Number(f.odenen_tutar || 0);
      return {
        'Fatura No': Number(f.id),
        'Tarih': new Date(f.tarih).toLocaleDateString('tr-TR'),
        'Tedarikçi': f.cari,
        'Toplam (₺)': toplam,
        'Ödenen (₺)': odenen,
        'Kalan (₺)': toplam - odenen,
        'Durum':
          f.durum === 'odendi'
            ? 'Ödendi'
            : f.durum === 'kismi'
            ? 'Kısmi'
            : 'Ödenmedi',
      };
    });

    const icerik = await excelOlustur(veri, 'Alış Faturaları');
    return {
      ok: true,
      icerik,
      dosya: `alis_faturalari_${tarihStr()}.xlsx`,
    };
  } catch (err) {
    console.error('alisFaturalariExcel:', err);
    return { error: 'Excel oluşturulamadı.' };
  }
}

// ==================== CARİ BAKİYELERİ ====================
export async function cariBakiyeleriExcelAction() {
  try {
    const rows = await query(
      `SELECT
         c.id, c.unvan, c.tip, c.telefon,
         COALESCE(s.fatura_toplam, 0) - COALESCE(s.tahsilat, 0) AS borc,
         COALESCE(a.fatura_toplam, 0) - COALESCE(a.odeme, 0)    AS alacak
       FROM cariler c
       LEFT JOIN (
         SELECT f.cari_id,
                SUM(d.adet * d.birim_fiyat) AS fatura_toplam,
                (SELECT COALESCE(SUM(fo.tutar), 0)
                   FROM fatura_odemeleri fo
                  WHERE fo.fatura_tipi = 'satis'
                    AND fo.fatura_id IN (SELECT id FROM satis_faturalar WHERE cari_id = f.cari_id)
                ) AS tahsilat
           FROM satis_faturalar f
           JOIN satis_fatura_detaylari d ON d.fatura_id = f.id
          GROUP BY f.cari_id
       ) s ON s.cari_id = c.id
       LEFT JOIN (
         SELECT f.cari_id,
                SUM(d.miktar * d.birim_fiyat) AS fatura_toplam,
                (SELECT COALESCE(SUM(fo.tutar), 0)
                   FROM fatura_odemeleri fo
                  WHERE fo.fatura_tipi = 'alis'
                    AND fo.fatura_id IN (SELECT id FROM alis_faturalar WHERE cari_id = f.cari_id)
                ) AS odeme
           FROM alis_faturalar f
           JOIN alis_fatura_detaylari d ON d.fatura_id = f.id
          GROUP BY f.cari_id
       ) a ON a.cari_id = c.id
       WHERE c.aktif = 1
       ORDER BY c.unvan`
    );

    const veri = rows.map((c) => {
      const borc = Number(c.borc);
      const alacak = Number(c.alacak);
      return {
        'Ünvan': c.unvan,
        'Tip':
          c.tip === 'tedarikci'
            ? 'Tedarikçi'
            : c.tip === 'musteri'
            ? 'Müşteri'
            : 'Her İkisi',
        'Telefon': c.telefon ?? '',
        'Borç (₺)': borc,
        'Alacak (₺)': alacak,
        'Bakiye (₺)': borc - alacak,
      };
    });

    const icerik = await excelOlustur(veri, 'Cari Bakiyeleri');
    return {
      ok: true,
      icerik,
      dosya: `cari_bakiyeleri_${tarihStr()}.xlsx`,
    };
  } catch (err) {
    console.error('cariBakiyeleriExcel:', err);
    return { error: 'Excel oluşturulamadı.' };
  }
}

// ==================== STOK ====================
export async function stokExcelAction() {
  try {
    const rows = await query(
      `SELECT id, urun_adi, tip, kritik_seviye,
              varsayilan_alis_fiyati, varsayilan_satis_fiyati, stok
         FROM urunler
        WHERE durum = 1
        ORDER BY urun_adi`
    );

    const veri = rows.map((u) => ({
      'Ürün Adı': u.urun_adi,
      'Tip': u.tip === 'hammadde' ? 'Hammadde' : 'Satış Ürünü',
      'Stok': Number(u.stok),
      'Kritik': Number(u.kritik_seviye),
      'Alış Fiyatı (₺)': Number(u.varsayilan_alis_fiyati),
      'Satış Fiyatı (₺)': Number(u.varsayilan_satis_fiyati),
      'Stok Değeri (₺)': Number(u.stok) * Number(u.varsayilan_alis_fiyati),
    }));

    const icerik = await excelOlustur(veri, 'Stok');
    return {
      ok: true,
      icerik,
      dosya: `stok_${tarihStr()}.xlsx`,
    };
  } catch (err) {
    console.error('stokExcel:', err);
    return { error: 'Excel oluşturulamadı.' };
  }
}

// ==================== KASA HAREKETLERİ ====================
export async function kasaHareketleriExcelAction() {
  try {
    const rows = await query(
      `SELECT h.id, h.tarih, k.ad AS kasa, h.tip, h.tutar, h.aciklama
         FROM kasa_hareketleri h
         JOIN kasa_hesaplari k ON k.id = h.kasa_id
        ORDER BY h.tarih DESC, h.id DESC`
    );

    const veri = rows.map((h) => ({
      'No': Number(h.id),
      'Tarih': new Date(h.tarih).toLocaleDateString('tr-TR'),
      'Kasa': h.kasa,
      'Tip': h.tip === 'giris' ? 'Giriş' : 'Çıkış',
      'Tutar (₺)': Number(h.tutar),
      'Açıklama': h.aciklama ?? '',
    }));

    const icerik = await excelOlustur(veri, 'Kasa Hareketleri');
    return {
      ok: true,
      icerik,
      dosya: `kasa_hareketleri_${tarihStr()}.xlsx`,
    };
  } catch (err) {
    console.error('kasaHareketleriExcel:', err);
    return { error: 'Excel oluşturulamadı.' };
  }
}
