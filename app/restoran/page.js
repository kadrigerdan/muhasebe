import Link from 'next/link';
import { masaDurumlari } from '@/models/masaModel';
import { adisyonOzet } from '@/models/adisyonModel';
import MasaGrid from '@/components/restoran/MasaGrid';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function RestoranPage() {
  const [masalar, ozet] = await Promise.all([
    masaDurumlari(),
    adisyonOzet(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      <div className="bg-gray-100 border rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">



        <div className="flex gap-2">
          <Link
            href="/"
            className="text-blue-600 hover:underline self-center"
          >
            ← Ana Sayfa
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Restoran — Masalar</h1>
        </div>

        {/* Özet Şerit — ince, gri, tıklanamaz */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-gray-600">Açık Adisyon:</span>
          <span className="font-bold text-red-700">{String(ozet.acik_adisyon)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-gray-600">Bugün Kapanan:</span>
          <span className="font-bold text-green-700">{String(ozet.bugun_kapanan)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-gray-600">Bugün Ciro:</span>
          <span className="font-bold">{paraFormat(ozet.bugun_ciro)} ₺</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          <span className="text-gray-600">Mutfakta Bekleyen:</span>
          <span className="font-bold text-orange-700">{String(ozet.mutfak_bekleyen)}</span>
        </div>



      </div>

      {/* Masalar */}
      <MasaGrid masalar={masalar} />

      {/* Renk Açıklaması */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
        {/* Sol: Renk Açıklaması */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-400 rounded"></div>
            <span>Boş masa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-400 rounded"></div>
            <span>Dolu masa (adisyon açık)</span>
          </div>
        </div>

        {/* Sağ: Mutfak Butonu */}
        <Link
          href="/mutfak"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center whitespace-nowrap"
        >
          🍳 Mutfak Ekranı
        </Link>
      </div>
    </div>
  );
}
