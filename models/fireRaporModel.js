import { query } from '@/database/db';

export async function fireRaporu({ baslangic, bitis, depo_id } = {}) {
  const sartlar = ["sh.kaynak = 'fire'"];
  const params = [];

  if (baslangic) {
    sartlar.push('sh.tarih >= ?');
    params.push(baslangic);
  }
  if (bitis) {
    sartlar.push('sh.tarih <= ?');
    params.push(bitis);
  }
  if (depo_id && Number(depo_id) > 0) {
    sartlar.push('sh.depo_id = ?');
    params.push(Number(depo_id));
  }

  const rows = await query(`
        SELECT 
            sh.id,
            sh.tarih,
            sh.miktar,
            sh.kaynak_id AS uretim_id,
            sh.aciklama,
            u.id AS urun_id,
            u.urun_adi,
            u.tip,
            u.varsayilan_alis_fiyati,
            d.id AS depo_id,
            d.ad AS depo_adi,
            (sh.miktar * COALESCE(u.varsayilan_alis_fiyati, 0)) AS fire_degeri
          FROM stok_hareketleri sh
          JOIN urunler u ON u.id = sh.urun_id
          JOIN depolar d ON d.id = sh.depo_id
         WHERE ${sartlar.join(' AND ')}
         ORDER BY sh.tarih DESC, sh.id DESC
    `, params);

  return rows;
}

export async function fireOzet({ baslangic, bitis, depo_id } = {}) {
  const sartlar = ["sh.kaynak = 'fire'"];
  const params = [];

  if (baslangic) {
    sartlar.push('sh.tarih >= ?');
    params.push(baslangic);
  }
  if (bitis) {
    sartlar.push('sh.tarih <= ?');
    params.push(bitis);
  }
  if (depo_id && Number(depo_id) > 0) {
    sartlar.push('sh.depo_id = ?');
    params.push(Number(depo_id));
  }

  const rows = await query(`
        SELECT 
            COUNT(*) AS kayit_sayisi,
            COALESCE(SUM(sh.miktar), 0) AS toplam_kg,
            COALESCE(SUM(sh.miktar * COALESCE(u.varsayilan_alis_fiyati, 0)), 0) AS toplam_deger
          FROM stok_hareketleri sh
          JOIN urunler u ON u.id = sh.urun_id
         WHERE ${sartlar.join(' AND ')}
    `, params);

  return rows[0] ?? { kayit_sayisi: 0, toplam_kg: 0, toplam_deger: 0 };
}