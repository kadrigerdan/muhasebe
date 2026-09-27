import { query } from '@/lib/db';

export async function tumTedarikciler() {
    return await query(
        'SELECT id, unvan, telefon, adres, created_at FROM tedarikciler ORDER BY id DESC'
    );
}

export async function tedarikciGetir(id) {
    const rows = await query(
        'SELECT * FROM tedarikciler WHERE id = ?',
        [id]
    );
    return rows[0] ?? null;
}

export async function tedarikciOlustur({ unvan, telefon, adres }) {
    const res = await query(
        'INSERT INTO tedarikciler (unvan, telefon, adres) VALUES (?, ?, ?)',
        [unvan, telefon ?? null, adres ?? null]
    );
    return Number(res.insertId); // mariadb: Number döner
}

export async function tedarikciGuncelleDB(id, { unvan, telefon, adres }) {
    const res = await query(
        'UPDATE tedarikciler SET unvan = ?, telefon = ?, adres = ? WHERE id = ?',
        [unvan, telefon ?? null, adres ?? null, id]
    );
    return res.affectedRows;
}

export async function tedarikciSilDB(id) {
    const res = await query(
        'DELETE FROM tedarikciler WHERE id = ?',
        [id]
    );
    return res.affectedRows;
}