'use server';

import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'database', 'backups');
const TUTULACAK_YEDEK_SAYISI = 7;

async function klasorGarantile() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch { }
}

// Son N yedeği tut, gerisini sil (tam / manuel / oto grupları ayrı)
async function eskiYedekleriTemizle(silinecekOncesi = TUTULACAK_YEDEK_SAYISI) {
    try {
        const dosyalar = await fs.readdir(BACKUP_DIR);

        const gruplar = {
            tam: dosyalar.filter(f => f.startsWith('muhasebe_tam_') && f.endsWith('.tar.gz')),
            geriyukleme: dosyalar.filter(f => f.startsWith('muhasebe_geriyukleme_oncesi_') && f.endsWith('.sql')),
            manuel: dosyalar.filter(f =>
                f.startsWith('muhasebe_') &&
                !f.startsWith('muhasebe_tam_') &&
                !f.startsWith('muhasebe_oto_') &&
                !f.startsWith('muhasebe_geriyukleme_oncesi_') &&
                f.endsWith('.sql')
            ),
            oto: dosyalar.filter(f => f.startsWith('muhasebe_oto_') && f.endsWith('.sql')),
        };

        const limitler = {
            tam: silinecekOncesi,   // 7
            geriyukleme: 2,                 // sadece son 2
            manuel: silinecekOncesi,   // 7
            oto: 3,                 // sadece son 3
        };

        for (const [grup, liste] of Object.entries(gruplar)) {
            const sirali = liste.sort().reverse();
            const silinecekler = sirali.slice(limitler[grup]);

            for (const eski of silinecekler) {
                try {
                    await fs.unlink(path.join(BACKUP_DIR, eski));
                    console.log(`[${grup}] Silindi:`, eski);
                } catch (err) {
                    console.warn(`[${grup}] Silinemedi:`, eski, err.message);
                }
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

    try {
        // 1) SQL dump
        const dumpCmd = `(mariadb-dump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${sqlKokYol}") 2>&1 || (mysqldump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${sqlKokYol}")`;

        await execAsync(dumpCmd, { maxBuffer: 200 * 1024 * 1024 });
        const statSql = await fs.stat(sqlKokYol);
        if (statSql.size === 0) throw new Error('SQL dump boş.');

        // 2) tar
        const kokDizin = process.cwd();
        const adaylar = [
            sqlAdi, 'database/migrations',
            'actions', 'app', 'components', 'lib', 'modals', 'models',
            'public', 'screenshots', 'scripts',
            '.env.local', '.gitignore', '.eslintconfig.mjs',
            'AGENTS.md', 'CLAUDE.md',
            'jsconfig.json', 'next.config.mjs', 'next.config.js',
            'package.json', 'yarn.lock',
        ];
        const { existsSync } = await import('fs');
        const mevcut = adaylar.filter(a => existsSync(path.join(kokDizin, a)));

        if (mevcut.length === 0) throw new Error('Yedeklenecek dosya bulunamadı.');

        const args = [
            '-czf', tarYol, '-C', kokDizin,
            '--exclude=node_modules', '--exclude=.next', '--exclude=.git',
            '--exclude=database/backups',
            ...mevcut,
        ];

        const { execFileSync } = await import('child_process');
        execFileSync('tar', args, { stdio: 'inherit' });

        await eskiYedekleriTemizle();

        const stat = await fs.stat(tarYol);
        revalidatePath('/yedekleme');
        return { ok: true, dosya: tarAdi, boyut: stat.size };
    } catch (err) {
        console.error('tamYedek:', err);
        return { error: 'Yedek alınamadı: ' + (err.message || '') };
    } finally {
        // HER KOŞULDA SQL dosyasını sil
        try { await fs.unlink(sqlKokYol); } catch { }
    }
}

// ==================== GERİ YÜKLEME ====================
export async function yedektenGeriYukleAction(dosyaAdi) {
    const guvenli = path.basename(dosyaAdi);
    if (!guvenli.endsWith('.sql') && !guvenli.endsWith('.tar.gz')) {
        return { error: 'Geçersiz dosya.' };
    }

    const kaynakYol = path.join(BACKUP_DIR, guvenli);
    try {
        await fs.access(kaynakYol);
    } catch {
        return { error: 'Yedek dosyası bulunamadı.' };
    }

    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || '3306';
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;
    const db = process.env.DB_DATABASE;

    const guvenlikDamga = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const guvenlikAdi = `muhasebe_geriyukleme_oncesi_${guvenlikDamga}.sql`;
    const guvenlikYol = path.join(BACKUP_DIR, guvenlikAdi);
    const guvenlikCmd = `(mariadb-dump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${guvenlikYol}") 2>&1 || (mysqldump -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} > "${guvenlikYol}")`;

    try {
        await execAsync(guvenlikCmd, { maxBuffer: 200 * 1024 * 1024 });
    } catch (err) {
        console.error('Güvenlik yedeği:', err);
        return { error: 'Geri yükleme öncesi güvenlik yedeği alınamadı: ' + (err.message || '') };
    }

    let sqlYolu = null;
    let geciciDizin = null;

    try {
        if (guvenli.endsWith('.sql')) {
            sqlYolu = kaynakYol;
        } else {
            geciciDizin = await fs.mkdtemp(path.join(process.cwd(), 'tmp-restore-'));
            const { execFileSync } = await import('child_process');
            execFileSync('tar', ['-xzf', kaynakYol, '-C', geciciDizin], { stdio: 'inherit' });

            const icerik = await fs.readdir(geciciDizin);
            const sqlDosya = icerik.find(f => f.endsWith('.sql'));
            if (!sqlDosya) throw new Error('Arşiv içinde .sql dosyası bulunamadı.');
            sqlYolu = path.join(geciciDizin, sqlDosya);
        }

        const importCmd = `(mariadb -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} < "${sqlYolu}") 2>&1 || (mysql -h ${host} -P ${port} -u ${user} -p'${pass}' ${db} < "${sqlYolu}")`;
        await execAsync(importCmd, { maxBuffer: 500 * 1024 * 1024 });

        revalidatePath('/yedekleme');
        return {
            ok: true,
            kaynak: guvenli,
            guvenlikYedegi: guvenlikAdi,
            mesaj: `Geri yükleme tamamlandı. Mevcut durum "${guvenlikAdi}" olarak kaydedildi.`,
        };
    } catch (err) {
        console.error('geriYukle:', err);
        return { error: 'Geri yükleme başarısız: ' + (err.message || '') };
    } finally {
        if (geciciDizin) {
            try {
                await fs.rm(geciciDizin, { recursive: true, force: true });
            } catch { }
        }
    }
}