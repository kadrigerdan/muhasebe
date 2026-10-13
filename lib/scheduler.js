// Bu dosya SADECE Node.js runtime'da çalışır
// Edge Runtime'da import edilmemeli

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function yedekAl(onek = 'oto') {
  const BACKUP_DIR = path.join(process.cwd(), 'database', 'backups');
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const damga = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
  const dosya = `muhasebe_${onek}_${damga}.sql`;
  const tamYol = path.join(BACKUP_DIR, dosya);

  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;
  const db = process.env.DB_DATABASE;

  const cmd = `mariadb-dump -h ${host} -u ${user} -p'${pass}' ${db} > "${tamYol}"`;
  await execAsync(cmd, { maxBuffer: 200 * 1024 * 1024 });

  const stat = await fs.stat(tamYol);
  const kb = (stat.size / 1024).toFixed(0);

  // 30 günden eski OTO yedekleri sil
  const sinir = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dosyalar = await fs.readdir(BACKUP_DIR);
  let silinen = 0;
  for (const d of dosyalar) {
    if (!d.startsWith('muhasebe_oto_') || !d.endsWith('.sql')) continue;
    const yol = path.join(BACKUP_DIR, d);
    const st = await fs.stat(yol);
    if (st.mtimeMs < sinir) {
      await fs.unlink(yol);
      silinen++;
    }
  }

  return { dosya, kb, silinen };
}

export function sonrakiGeceYarisi() {
  const simdi = new Date();
  const hedef = new Date();
  hedef.setHours(3, 0, 0, 0); // 03:00
  if (hedef.getTime() <= simdi.getTime()) {
    hedef.setDate(hedef.getDate() + 1);
  }
  return hedef.getTime() - simdi.getTime();
}
