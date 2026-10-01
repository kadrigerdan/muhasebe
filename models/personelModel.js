import { query } from "@/database/db";

// -------- LİSTE --------
export async function tumPersonel({ aktif, departman, arama } = {}) {
    const sartlar = ['1=1'];
    const params = [];

    if (aktif !== undefined) {
        sartlar.push('aktif = ?');
        params.push(aktif ? 1 : 0);
    }
    if (departman) {
        sartlar.push('departman = ?');
        params.push(departman);
    }
    if (arama) {
        sartlar.push('(ad LIKE ? OR soyad LIKE ? OR gorev LIKE ?)');
        const q = `%${arama}%`;
        params.push(q, q, q);
    }

    return await query(
        `SELECT id, ad, soyad, tc_kimlik, telefon, email, gorev, departman,
            maas, ise_giris_tarihi, aktif
       FROM personel
      WHERE ${sartlar.join(' AND ')}
      ORDER BY aktif DESC, ad, soyad`,
        params
    );
}

export async function personelGetir(id) {
    const rows = await query('SELECT * FROM personel WHERE id = ?', [id]);
    return rows[0] ?? null;
}

export async function personelOlustur(veri) {
    const res = await query(
        `INSERT INTO personel
       (ad, soyad, tc_kimlik, sgk_no, telefon, email, adres,
        dogum_tarihi, egitim_durumu, ehliyet_sinifi, ehliyet_tarihi,
        ise_giris_tarihi, isten_cikis_tarihi, gorev, departman,
        maas, banka_adi, iban, aktif, notlar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            veri.ad, veri.soyad, veri.tc_kimlik ?? null, veri.sgk_no ?? null,
            veri.telefon ?? null, veri.email ?? null, veri.adres ?? null,
            veri.dogum_tarihi ?? null, veri.egitim_durumu ?? null,
            veri.ehliyet_sinifi ?? null, veri.ehliyet_tarihi ?? null,
            veri.ise_giris_tarihi, veri.isten_cikis_tarihi ?? null,
            veri.gorev ?? null, veri.departman ?? null,
            veri.maas ?? 0, veri.banka_adi ?? null, veri.iban ?? null,
            veri.aktif ?? 1, veri.notlar ?? null,
        ]
    );
    return Number(res.insertId);
}

export async function personelGuncelleDB(id, veri) {
    const res = await query(
        `UPDATE personel SET
       ad = ?, soyad = ?, tc_kimlik = ?, sgk_no = ?, telefon = ?, email = ?,
       adres = ?, dogum_tarihi = ?, egitim_durumu = ?, ehliyet_sinifi = ?,
       ehliyet_tarihi = ?, ise_giris_tarihi = ?, isten_cikis_tarihi = ?,
       gorev = ?, departman = ?, maas = ?, banka_adi = ?, iban = ?,
       aktif = ?, notlar = ?
     WHERE id = ?`,
        [
            veri.ad, veri.soyad, veri.tc_kimlik ?? null, veri.sgk_no ?? null,
            veri.telefon ?? null, veri.email ?? null, veri.adres ?? null,
            veri.dogum_tarihi ?? null, veri.egitim_durumu ?? null,
            veri.ehliyet_sinifi ?? null, veri.ehliyet_tarihi ?? null,
            veri.ise_giris_tarihi, veri.isten_cikis_tarihi ?? null,
            veri.gorev ?? null, veri.departman ?? null,
            veri.maas ?? 0, veri.banka_adi ?? null, veri.iban ?? null,
            veri.aktif ?? 1, veri.notlar ?? null, id,
        ]
    );
    return Number(res.affectedRows);
}

export async function personelSilDB(id) {
    const res = await query('DELETE FROM personel WHERE id = ?', [id]);
    return Number(res.affectedRows);
}

// -------- ÖDEMELER --------
export async function personelOdemeleri(personelId) {
    return await query(
        `SELECT id, odeme_tipi, tutar, tarih, donem, aciklama,
            kasadan_dus, kasa_hareket_id, created_at
       FROM personel_odeme
      WHERE personel_id = ?
      ORDER BY tarih DESC, id DESC`,
        [personelId]
    );
}

export async function personelOdemeOzet(personelId) {
    const rows = await query(
        `SELECT
       COALESCE(SUM(CASE WHEN odeme_tipi = 'maas'    THEN tutar ELSE 0 END), 0) AS toplam_maas,
       COALESCE(SUM(CASE WHEN odeme_tipi = 'avans'   THEN tutar ELSE 0 END), 0) AS toplam_avans,
       COALESCE(SUM(CASE WHEN odeme_tipi = 'prim'    THEN tutar ELSE 0 END), 0) AS toplam_prim,
       COALESCE(SUM(CASE WHEN odeme_tipi = 'ikramiye' THEN tutar ELSE 0 END), 0) AS toplam_ikramiye,
       COALESCE(SUM(CASE WHEN odeme_tipi = 'kesinti' THEN tutar ELSE 0 END), 0) AS toplam_kesinti,
       COALESCE(SUM(CASE WHEN odeme_tipi IN ('maas','avans','prim','ikramiye','diger') THEN tutar ELSE 0 END), 0) AS toplam_odenen
     FROM personel_odeme
     WHERE personel_id = ?`,
        [personelId]
    );
    return rows[0];
}

export async function odemeEkle(veri) {
    const res = await query(
        `INSERT INTO personel_odeme
       (personel_id, odeme_tipi, tutar, tarih, donem, aciklama, kasadan_dus)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            veri.personel_id, veri.odeme_tipi, veri.tutar, veri.tarih,
            veri.donem ?? null, veri.aciklama ?? null,
            veri.kasadan_dus ? 1 : 0,
        ]
    );
    return Number(res.insertId);
}

export async function odemeSilDB(id) {
    const res = await query('DELETE FROM personel_odeme WHERE id = ?', [id]);
    return Number(res.affectedRows);
}

// -------- ÖZET (Ana sayfa için) --------
export async function personelMaliOzet() {
    const rows = await query(
        `SELECT
       (SELECT COUNT(*) FROM personel WHERE aktif = 1) AS aktif_personel,
       (SELECT COUNT(*) FROM personel WHERE aktif = 0) AS pasif_personel,
       (SELECT COALESCE(SUM(maas), 0) FROM personel WHERE aktif = 1) AS aylik_maas_toplam
     `
    );
    return rows[0];
}

// -------- DEPARTMAN LİSTESİ --------
export async function departmanListesi() {
    return await query(
        `SELECT DISTINCT departman FROM personel
      WHERE departman IS NOT NULL AND departman != ''
      ORDER BY departman`
    );
}