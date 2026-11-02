// instrumentation.node.js
export async function register() {
  if (global._muhasebeScheduler) return;
  global._muhasebeScheduler = true;

  const { yedekAl, sonrakiGeceYarisi } = await import('./lib/scheduler.js');

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
      zamanlayiciBaslat();
    }, bekleMs);
  }

  zamanlayiciBaslat();

  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🕐 Zamanlayıcı aktif                      ║');
  console.log('║  Her gece 03:00 otomatik yedek alınacak    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
}