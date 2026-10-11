// Next.js başlarken otomatik yüklenir
// Kütüphanesiz zamanlayıcı — saf JavaScript

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Dev mode'da birden fazla başlamasın
  if (global._muhasebeScheduler) return;
  global._muhasebeScheduler = true;

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const fs = await import('fs/promises');
  const path = await import('path');

  const execAsync = promisify(exec);
  const BACKUP_DIR = path.join(process.cwd(), 'database', 'backups');

  // ==================== YEDEK ALMA ====================
  async function yedekAl(onek = 'oto') {
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

  // ==================== ZAMAN HESABI ====================
  // Bir sonraki 03:00'e kaç ms kaldı?
  function sonrakiGeceYarisi() {
    const simdi = new Date();
    const hedef = new Date();
    hedef.setHours(3, 0, 0, 0); // Bugün 03:00

    // 03:00 geçtiyse yarına at
    if (hedef.getTime() <= simdi.getTime()) {
      hedef.setDate(hedef.getDate() + 1);
    }

    return hedef.getTime() - simdi.getTime();
  }

  // ==================== ZAMANLAYICI ====================
  function zamanlayiciBaslat() {
    const bekleMs = sonrakiGeceYarisi();
    const bekleSaat = (bekleMs / 1000 / 60 / 60).toFixed(1);

    const hedef = new Date(Date.now() + bekleMs);
    console.log(
      `[Zamanlayıcı] Sonraki yedek: ${hedef.toLocaleString('tr-TR')} (${bekleSaat} saat sonra)`
    );

    setTimeout(async () => {
      const zaman = new Date().toLocaleString('tr-TR');
      console.log(`\n[Zamanlayıcı ${zaman}] Yedek başlıyor...`);

      try {
        const sonuc = await yedekAl('oto');
        console.log(`[Zamanlayıcı] ✓ Yedek alındı: ${sonuc.dosya} (${sonuc.kb} KB)`);
        if (sonuc.silinen > 0) {
          console.log(`[Zamanlayıcı] ${sonuc.silinen} eski yedek silindi`);
        }
      } catch (err) {
        console.error('[Zamanlayıcı] ✗ Hata:', err.message || err);
      }

      // Bir sonraki güne planla
      zamanlayiciBaslat();
    }, bekleMs);
  }

  // Başlat
  zamanlayiciBaslat();

  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🕐 Zamanlayıcı aktif                      ║');
  console.log('║  Her gece 03:00 otomatik yedek alınacak    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
}
