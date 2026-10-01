import Link from 'next/link';
import { tumKasaHesaplari, kasaOzet } from '@/models/kasaModel';

export const dynamic = 'force-dynamic';

export default async function KasaPage() {
  const [hesaplar, ozet] = await Promise.all([
    tumKasaHesaplari(),
    kasaOzet(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kasa</h1>
        <div className="flex gap-2">
          <Link href="/kasa/hesaplar/yeni"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Yeni Kasa
          </Link>
          <Link href="/kasa/hareketler"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Tüm Hareketler
          </Link>
        </div>
      </div>

      <div className="border rounded-lg p-5 bg-white">
        <div className="text-sm text-gray-500 mb-1">Toplam Bakiye</div>
        <div className="text-3xl font-bold">
          {Number(ozet.toplam_bakiye).toFixed(2)} ₺
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {String(ozet.aktif_kasa_sayisi)} aktif kasa
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hesaplar.map((k) => (
          <Link key={String(k.id)} href={`/kasa/${k.id}`}
            className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">{k.ad}</div>
              <span className={`text-xs px-2 py-0.5 rounded ${k.tip === 'nakit' ? 'bg-green-100 text-green-700' :
                k.tip === 'banka' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                {k.tip}
              </span>
            </div>
            <div className="text-2xl font-bold mb-2">
              {Number(k.bakiye).toFixed(2)} ₺
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Açılış: {Number(k.acilis_bakiye).toFixed(2)} ₺</div>
              <div className="text-green-700">+ Giriş: {Number(k.toplam_giris).toFixed(2)} ₺</div>
              <div className="text-red-700">- Çıkış: {Number(k.toplam_cikis).toFixed(2)} ₺</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}