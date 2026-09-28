import { query } from "@/database/db";

export async function getMusteriler() {
    try {
        return await query(
            `SELECT id, unvan, telefon, adres
       FROM musteriler
       ORDER BY id ASC`
        );
    } catch (error) {
        console.error("Müşteriler alınamadı:", error);
        return [];
    }
}