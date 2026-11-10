import Link from 'next/link';
import { query } from '@/database/db';

export const dynamic = 'force-dynamic';

export default async function DepolarPage() {
  // Her depodaki toplam stok değeri ve ürün çeşidi sayısı
  const depolar = await query(`
        SELECT 
            d.id, 
            d.ad,
            COUNT(DISTINCT us.urun_id) AS urun_cesidi,
            COALESCE(SUM(us.stok), 0) AS toplam_miktar
        FROM depolar d
        LEFT JOIN urun_stok us ON us.depo_id = d.id AND us.stok > 0
        GROUP BY d.id, d.ad
        ORDER BY d.id
    `);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-around gap-6">
        <h1 className="text-2xl font-bold ">Depolar</h1>
        <Link
          href="/depolar/virman"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          ↔️ Virman Yap
        </Link>
        <Link
          href="/depolar/fire"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
        >
          🔥 Fire Raporu
        </Link>
        <Link href="/depolar/uretim" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
          🔪 Parçalama Yap
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {depolar.map((d) => (
          <Link
            key={d.id}
            href={`/depolar/${d.id}`}
            className="border rounded-lg p-4 bg-white hover:shadow-md transition"
          >
            <div className="text-xs text-gray-500 mb-1">#{d.id}</div>
            <div className="text-lg font-bold mb-2">{d.ad}</div>
            <div className="text-sm text-gray-600">
              {d.urun_cesidi} çeşit ürün
            </div>
            <div className="text-sm text-gray-600">
              Toplam: {Number(d.toplam_miktar).toLocaleString('tr-TR')} birim
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}