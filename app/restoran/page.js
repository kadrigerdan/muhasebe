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
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Başlık + Özet Şerit + Butonlar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold">Restoran — Masalar</h1>

          {/* Özet Şerit */}
          <div className="bg-gray-100 border rounded-lg px-3 py-1.5 flex items-center gap-x-4 gap-y-1 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span className="text-gray-500">Açık:</span>
              <span className="font-bold text-red-700">
                {String(ozet.acik_adisyon)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-gray-500">Kapanan:</span>
              <span className="font-bold text-green-700">
                {String(ozet.bugun_kapanan)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span className="text-gray-500">Ciro:</span>
              <span className="font-bold">{paraFormat(ozet.bugun_ciro)} ₺</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              <span className="text-gray-500">Mutfak:</span>
              <span className="font-bold text-orange-700">
                {String(ozet.mutfak_bekleyen)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Link
            href="/mutfak"
            className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm"
          >
            🍳 Mutfak
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

      {/* Masalar */}
      <MasaGrid masalar={masalar} />

      {/* Renk Açıklama + Mutfak Butonu (alt) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
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
      </div>
    </div>
  );
}
