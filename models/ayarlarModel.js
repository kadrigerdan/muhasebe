import { query } from '@/database/db';

export async function ayarlariGetir() {
  const rows = await query('SELECT * FROM ayarlar WHERE id = 1');
  if (!rows.length) {
    // Yoksa oluştur
    await query('INSERT INTO ayarlar (id, sirket_adi) VALUES (1, ?)', ['ŞİRKET ADI']);
    const yeni = await query('SELECT * FROM ayarlar WHERE id = 1');
    return yeni[0];
  }
  return rows[0];
}

export async function ayarlariGuncelle(veri) {
  const res = await query(
    `UPDATE ayarlar SET
       sirket_adi = ?,
       adres = ?,
       telefon = ?,
       email = ?,
       vergi_no = ?,
       vergi_dairesi = ?,
       fatura_alt_not = ?,
       fis_alt_not = ?,
       logo_url = ?
     WHERE id = 1`,
    [
      veri.sirket_adi,
      veri.adres ?? null,
      veri.telefon ?? null,
      veri.email ?? null,
      veri.vergi_no ?? null,
      veri.vergi_dairesi ?? null,
      veri.fatura_alt_not ?? null,
      veri.fis_alt_not ?? null,
      veri.logo_url ?? null,
    ]
  );
  return Number(res.affectedRows);
}
