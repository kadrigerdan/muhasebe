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

  // Masa bazlı grupla
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🍳 Mutfak Ekranı</h1>
          <MutfakAutoRefresh intervalMs={5000} />
        </div>
        <Link
          href="/restoran"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🍽️ Masalar
        </Link>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-orange-50">
          <div className="text-xs text-orange-600 mb-1">Bekleyen Sipariş</div>
          <div className="text-3xl font-bold text-orange-700">
            {String(bekleyenler.length)}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-xs text-green-600 mb-1">Hazır</div>
          <div className="text-3xl font-bold text-green-700">
            {String(hazirlar.length)}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-gray-100">
          <div className="text-xs text-gray-600 mb-1">Açık Adisyon</div>
          <div className="text-3xl font-bold">
            {String(ozet.acik_adisyon)}
          </div>
        </div>
      </div>

      {/* Bekleyen Siparişler — Masa Bazlı */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-orange-700">
          🔔 Hazırlanacak — {bekleyenMasalar.length} masa
        </h2>
        {bekleyenMasalar.length === 0 && (
          <div className="border rounded-lg p-6 text-center text-gray-500 bg-white">
            Bekleyen sipariş yok. 👍
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bekleyenMasalar.map((m) => (
            <MutfakMasaKart key={String(m.adisyon_id)} masa={m} />
          ))}
        </div>
      </div>

      {/* Hazır Olanlar — Masa Bazlı */}
      {hazirMasalar.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-green-700">
            ✅ Hazır — {hazirMasalar.length} masa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hazirMasalar.map((m) => (
              <MutfakMasaKart key={String(m.adisyon_id)} masa={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
