import Link from 'next/link';
import { mutfakBekleyenler, adisyonOzet } from '@/models/adisyonModel';
import MutfakMasaKart from '@/components/restoran/MutfakMasaKart';
import MutfakAutoRefresh from '@/components/restoran/MutfakAutoRefresh';

export const dynamic = 'force-dynamic';

export default async function MutfakPage() {
  const [kalemler, ozet] = await Promise.all([
    mutfakBekleyenler(),
    adisyonOzet(),
  ]);

  const bekleyenler = kalemler.filter((k) => k.mutfak_durum === 'bekliyor');
  const hazirlar = kalemler.filter((k) => k.mutfak_durum === 'hazir');

  function masayaGoreGrupla(liste) {
    const map = new Map();
    for (const k of liste) {
      const key = k.adisyon_id;
      if (!map.has(key)) {
        map.set(key, {
          adisyon_id: k.adisyon_id,
          masa_ad: k.masa_ad,
          masa_tip: k.masa_tip,
          acilis: k.created_at,
          kalemler: [],
        });
      }
      map.get(key).kalemler.push(k);
    }
    return Array.from(map.values());
  }

  const bekleyenMasalar = masayaGoreGrupla(bekleyenler);
  const hazirMasalar = masayaGoreGrupla(hazirlar);

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">🍳 Mutfak Ekranı</h1>
          <MutfakAutoRefresh intervalMs={5000} />
        </div>
        <div className="flex gap-2 items-center">
          <Link
            href="/restoran"
            className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
          >
            🍽️ Masalar
          </Link>
          <a
            href="/cikis"
            className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm"
            title="Çıkış"
          >
            🚪
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="border rounded-lg p-3 sm:p-4 bg-orange-50">
          <div className="text-xs text-orange-600 mb-1">Bekleyen</div>
          <div className="text-2xl sm:text-3xl font-bold text-orange-700">
            {String(bekleyenler.length)}
          </div>
        </div>
        <div className="border rounded-lg p-3 sm:p-4 bg-green-50">
          <div className="text-xs text-green-600 mb-1">Hazır</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-700">
            {String(hazirlar.length)}
          </div>
        </div>
        <div className="border rounded-lg p-3 sm:p-4 bg-gray-100">
          <div className="text-xs text-gray-600 mb-1">Açık Adisyon</div>
          <div className="text-2xl sm:text-3xl font-bold">
            {String(ozet.acik_adisyon)}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3 text-orange-700">
          🔔 Hazırlanacak — {bekleyenMasalar.length} masa
        </h2>
        {bekleyenMasalar.length === 0 && (
          <div className="border rounded-lg p-6 text-center text-gray-500 bg-white">
            Bekleyen sipariş yok. 👍
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {bekleyenMasalar.map((m) => (
            <MutfakMasaKart key={String(m.adisyon_id)} masa={m} />
          ))}
        </div>
      </div>

      {hazirMasalar.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-bold mb-3 text-green-700">
            ✅ Hazır — {hazirMasalar.length} masa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {hazirMasalar.map((m) => (
              <MutfakMasaKart key={String(m.adisyon_id)} masa={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
