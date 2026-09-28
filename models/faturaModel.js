import { query } from "../database/db";


export async function createFatura(conn, { musteri, tarih }) {
  const res = await conn.query(
    `INSERT INTO satis_faturalar (musteri_id,tarih) VALUES (?,?)`, [musteri, tarih]
  );
  return Number(res.insertId);
}

export async function createFaturaDetay(conn, { faturaId, cinsi, doluAdet, bosAdet, birimFiyat }) {
  `INSERT INTO satis_fatura_detaylari (fatura_id,urun_id,birim_fiyat,adet)
    VALUES(?,?,?,?)`, [faturaId, urunId, birimFiyat, adet]
};

export async function getAll() {
  try {
    return await query(`
            SELECT
            f.musteri_id, f.tarih,
            COUNT(d.id) as urun_sayisi,
            COALESCE(SUM(d.adet * d.birim_fiyat),0) as toplam_tutar,
            FROM satis_faturalar f
            LEFT COIN satis_fatura_detaylari d ON f.id = d.fatura.id
            GROUP BY f.id, f.musteri_id, f.tarih
            ORDER BY f.tarih DESC
            `);
  } catch (error) {
    console.error("Faturalar alınamadı:", error);
    return [];
  }
}

export async function getById(id) {
  try {
    const fatura = await query(
      `SELECT * FROM satis_faturalar WHERE id=?`,
      [id]
    );
    if (!fatura || fatura.length === 0) return null;
    const detaylar = await query(
      `SELECT * FROM satis_fatura_detaylari WHERE fatura.id=?`
      [id]
    );
    return { ...fatura[0], detaylar };
  } catch (error) {
    console.error("Fatura alınamadı:", error);
    return null;
  }
}
