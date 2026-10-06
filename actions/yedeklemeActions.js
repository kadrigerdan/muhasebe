'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'database', 'backups');

async function klasorGarantile() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch { }
}

// ==================== SADECE DB ====================
export async function yedekAlAction() {
    await klasorGarantile();

    const damga = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const dosyaAdi = `muhasebe_${damga}.sql`;
    const tamYol = path.join(BACKUP_DIR, dosyaAdi);

    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || '3306';
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;
    const db = process.env.DB_DATABASE;

    const cmd = `(mariadb-dump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${tamYol}") 2>&1 || (mysqldump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${tamYol}")`;

    try {
        await execAsync(cmd, { maxBuffer: 200 * 1024 * 1024 });
        const stat = await fs.stat(tamYol);
        if (stat.size === 0) throw new Error('Yedek dosyası boş oluştu.');
        revalidatePath('/yedekleme');
        return { ok: true, dosya: dosyaAdi, boyut: stat.size };
    } catch (err) {
        console.error('yedekAl:', err);
        try { await fs.unlink(tamYol); } catch { }
        return { error: 'Yedek alınamadı: ' + (err.message || 'bilinmeyen hata') };
    }
}

export async function yedekListesiAction() {
    await klasorGarantile();
    const dosyalar = await fs.readdir(BACKUP_DIR);
    const liste = [];
    for (const d of dosyalar) {
        if (!d.endsWith('.sql') && !d.endsWith('.tar.gz')) continue;
        const stat = await fs.stat(path.join(BACKUP_DIR, d));
        liste.push({ ad: d, boyut: stat.size, tarih: stat.mtime.toISOString() });
    }
    liste.sort((a, b) => (a.tarih < b.tarih ? 1 : -1));
    return liste;
}

export async function yedekSilAction(dosyaAdi) {
    const guvenli = path.basename(dosyaAdi);
    if (!guvenli.endsWith('.sql') && !guvenli.endsWith('.tar.gz')) {
        return { error: 'Geçersiz dosya.' };
    }
    try {
        await fs.unlink(path.join(BACKUP_DIR, guvenli));
        revalidatePath('/yedekleme');
        return { ok: true };
    } catch (err) {
        console.error('yedekSil:', err);
        return { error: 'Dosya silinemedi.' };
    }
}

export async function yedekIcerikAction(dosyaAdi) {
    const guvenli = path.basename(dosyaAdi);
    if (!guvenli.endsWith('.sql') && !guvenli.endsWith('.tar.gz')) {
        return { error: 'Geçersiz dosya.' };
    }
    try {
        const tamYol = path.join(BACKUP_DIR, guvenli);
        const buffer = await fs.readFile(tamYol);
        const base64 = buffer.toString('base64');
        return { ok: true, icerik: base64, dosya: guvenli };
    } catch (err) {
        console.error('yedekIcerik:', err);
        return { error: 'Dosya okunamadı.' };
    }
}

// ==================== TAM YEDEK (DB + KOD) ====================
export async function tamYedekAlAction() {
    await klasorGarantile();
    const damga = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const sqlAdi = `muhasebe_${damga}.sql`;
    const sqlKokYol = path.join(process.cwd(), sqlAdi);
    const tarAdi = `muhasebe_tam_${damga}.tar.gz`;
    const tarYol = path.join(BACKUP_DIR, tarAdi);

    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || '3306';
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;
    const db = process.env.DB_DATABASE;

    // 1) SQL dump → kök dizine yaz (tar oradan alacak)
    const dumpCmd = `(mariadb-dump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${sqlKokYol}") 2>&1 || (mysqldump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${sqlKokYol}")`;

    try {
        await execAsync(dumpCmd, { maxBuffer: 200 * 1024 * 1024 });
        const stat = await fs.stat(sqlKokYol);
        if (stat.size === 0) throw new Error('SQL dump boş.');
    } catch (err) {
        console.error('sqlDump:', err);
        try { await fs.unlink(sqlKokYol); } catch { }
        return { error: 'SQL yedek alınamadı: ' + (err.message || '') };
    }

    // 2) tar.gz oluştur
    const kokDizin = process.cwd();
    const adaylar = [
        sqlAdi,                       // ← SQL kök dizinde, doğrudan ekle
        'database/migrations',
        'app',
        'components',
        'models',
        'actions',
        'modals',
        'lib',
        'public',
        'package.json',
        'yarn.lock',
        'next.config.js',
        'next.config.mjs',
        'jsconfig.json',
        '.env.local',
    ];

    const mevcut = [];
    for (const a of adaylar) {
        const tam = path.join(kokDizin, a);
        try {
            await fs.access(tam);
            mevcut.push(a);
        } catch { }
    }

    const tarCmd = `tar -czf "${tarYol}" -C "${kokDizin}" ${mevcut.map((m) => `"${m}"`).join(' ')}`;

    try {
        await execAsync(tarCmd, { maxBuffer: 200 * 1024 * 1024 });
        // SQL'i sil (tar içinde var)
        try { await fs.unlink(sqlKokYol); } catch { }
        const stat = await fs.stat(tarYol);
        revalidatePath('/yedekleme');
        return { ok: true, dosya: tarAdi, boyut: stat.size };
    } catch (err) {
        console.error('tar:', err);
        try { await fs.unlink(sqlKokYol); } catch { }
        return { error: 'Arşiv oluşturulamadı: ' + (err.message || '') };
    }
}
