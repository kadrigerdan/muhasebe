import Link from 'next/link';
import { tumKasaHesaplari, kasaOzet } from '@/models/kasaModel';
import { query } from '@/database/db';
import { paraFormat, sayiFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function KasaPage() {
  const [hesaplar, genelOzet, tipOzetArr] = await Promise.all([
    tumKasaHesaplari(),
    kasaOzet(),
    query(
      `SELECT
         COALESCE(SUM(CASE WHEN tip = 'nakit' THEN bakiye ELSE 0 END), 0) AS nakit,
         COALESCE(SUM(CASE WHEN tip = 'banka' THEN bakiye ELSE 0 END), 0) AS banka,
         COALESCE(SUM(CASE WHEN tip = 'pos'   THEN bakiye ELSE 0 END), 0) AS pos
       FROM kasa_bakiye_view
       WHERE aktif = 1`
    ),
  ]);

  const tipOzet = tipOzetArr[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kasa</h1>
        <div className="flex gap-2">
          <Link href="/kasa/virman"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Virman
          </Link>
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

      {/* Tip Bazlı Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-xs text-gray-500 mb-1">Nakit (Fiziksel)</div>
          <div className="text-2xl font-bold text-green-700">
            {paraFormat(tipOzet.nakit)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-xs text-gray-500 mb-1">Banka</div>
          <div className="text-2xl font-bold text-blue-700">
            {paraFormat(tipOzet.banka)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-xs text-gray-500 mb-1">POS</div>
          <div className="text-2xl font-bold text-purple-700">
            {paraFormat(tipOzet.pos)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-gray-100">
          <div className="text-xs text-gray-500 mb-1">Toplam Likidite</div>
          <div className="text-2xl font-bold">
            {paraFormat(genelOzet.toplam_bakiye)} ₺
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {sayiFormat(genelOzet.aktif_kasa_sayisi)} aktif kasa
          </div>
        </div>
      </div>

      {/* Kasa Kartları */}
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
              {paraFormat(k.bakiye)} ₺
            </div>
            <div className="text-xs text-gray-500">
              Açılış: {paraFormat(k.acilis_bakiye)} ₺
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}