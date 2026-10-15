'use server';

import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'database', 'backups');

async function klasorGarantile() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch { }
}

// Son N yedeği tut, gerisini sil
async function eskiYedekleriTemizle(silinecekOncesi = 7) {
    try {
        const dosyalar = await fs.readdir(BACKUP_DIR);
        const yedekler = dosyalar
            .filter(f => f.startsWith('muhasebe_tam_') && f.endsWith('.tar.gz'))
            .sort()          // tarih damgası sıralanabilir formatta (YYYYMMDDHHMMSS)
            .reverse();      // en yeni başta

        const silinecekler = yedekler.slice(silinecekOncesi);
        for (const eski of silinecekler) {
            try {
                await fs.unlink(path.join(BACKUP_DIR, eski));
                console.log('Eski yedek silindi:', eski);
            } catch (err) {
                console.warn('Silinemedi:', eski, err.message);
            }
        }
    } catch (err) {
        console.warn('Temizlik hatası:', err.message);
    }
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

    // 1) SQL dump
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
        sqlAdi,
        'database/migrations',
        'actions', 'app', 'components', 'lib', 'modals', 'models',
        'public', 'screenshots', 'scripts',
        '.env.local', '.gitignore', '.eslintconfig.mjs',
        'AGENTS.md', 'CLAUDE.md',
        'jsconfig.json', 'next.config.mjs', 'next.config.js',
        'package.json', 'yarn.lock',
    ];

    // Var olanları filtrele
    const { existsSync } = await import('fs');
    const mevcut = adaylar.filter(a => existsSync(path.join(kokDizin, a)));

    if (mevcut.length === 0) {
        try { await fs.unlink(sqlKokYol); } catch { }
        return { error: 'Yedeklenecek dosya bulunamadı.' };
    }

    const args = [
        '-czf', tarYol,
        '-C', kokDizin,
        '--exclude=node_modules',
        '--exclude=.next',
        '--exclude=.git',
        '--exclude=database/backups',
        ...mevcut,
    ];

    try {
        const { execFileSync } = await import('child_process');
        execFileSync('tar', args, { stdio: 'inherit' });

        // SQL'i sil (arşivin içinde)
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
