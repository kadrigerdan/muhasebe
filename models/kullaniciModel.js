import { query } from '@/database/db';

export async function tumKullanicilar() {
  return await query(
    `SELECT id, kullanici_adi, ad_soyad, rol, aktif, created_at
       FROM kullanicilar
      ORDER BY aktif DESC, ad_soyad`
  );
}

export async function kullaniciGetir(id) {
  const rows = await query(
    'SELECT id, kullanici_adi, ad_soyad, rol, aktif FROM kullanicilar WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

export async function kullaniciOlustur(veri) {
  const res = await query(
    `INSERT INTO kullanicilar (kullanici_adi, sifre_hash, ad_soyad, rol, aktif)
     VALUES (?, ?, ?, ?, ?)`,
    [veri.kullanici_adi, veri.sifre_hash, veri.ad_soyad, veri.rol, veri.aktif ?? 1]
  );
  return Number(res.insertId);
}

export async function kullaniciGuncelleDB(id, veri) {
  const res = await query(
    `UPDATE kullanicilar
        SET kullanici_adi = ?, ad_soyad = ?, rol = ?, aktif = ?
      WHERE id = ?`,
    [veri.kullanici_adi, veri.ad_soyad, veri.rol, veri.aktif ?? 1, id]
  );
  return Number(res.affectedRows);
}

export async function sifreGuncelle(id, sifre_hash) {
  const res = await query(
    'UPDATE kullanicilar SET sifre_hash = ? WHERE id = ?',
    [sifre_hash, id]
  );
  return Number(res.affectedRows);
}

export async function kullaniciSayisi() {
  const rows = await query(
    'SELECT COUNT(*) AS toplam FROM kullanicilar WHERE rol = "admin" AND aktif = 1'
  );
  return Number(rows[0]?.toplam ?? 0);
}
