import { query } from '@/database/db';
import UretimForm from '@/components/depolar/UretimForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UretimPage({ searchParams }) {
  const sp = await searchParams;
  const varsayilanHammaddeId = sp?.hammadde_id ? Number(sp.hammadde_id) : null;
  const varsayilanMiktar = sp?.miktar ? Number(sp.miktar) : null;

  const [depolar, urunler, sonUretimler] = await Promise.all([
    query('SELECT id, ad FROM depolar ORDER BY id'),
    query('SELECT id, urun_adi FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
    query(`
            SELECT 
                uk.id, uk.tarih, uk.hammadde_miktar, uk.fire_miktar,
                u.urun_adi AS hammadde_adi,
                d.ad AS depo_adi,
                (SELECT COALESCE(SUM(miktar), 0) FROM uretim_detaylari WHERE uretim_id = uk.id) AS mamul_toplam
            FROM uretim_kayitlari uk
            JOIN urunler u ON u.id = uk.hammadde_id
            JOIN depolar d ON d.id = uk.depo_id
            ORDER BY uk.id DESC
            LIMIT 10
        `),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parçalama / Üretim</h1>
        <Link href="/depolar" className="text-blue-600 hover:underline text-sm">
          ← Depolar
        </Link>
      </div>

      <UretimForm
        depolar={depolar}
        urunler={urunler}
        varsayilanHammaddeId={varsayilanHammaddeId}
        varsayilanMiktar={varsayilanMiktar}
      />

      {/* SON ÜRETİMLER */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Son Üretimler (Fire Raporu)</h2>
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-white">
            <tr>
              <th className="border p-2 text-center">#</th>
              <th className="border p-2 text-left">Tarih</th>
              <th className="border p-2 text-left">Depo</th>
              <th className="border p-2 text-left">Hammadde</th>
              <th className="border p-2 text-right">Kullanılan</th>
              <th className="border p-2 text-right">Mamul</th>
              <th className="border p-2 text-right">🔥 Fire</th>
            </tr>
          </thead>
          <tbody>
            {sonUretimler.length === 0 && (
              <tr>
                <td colSpan={7} className="border p-4 text-center text-gray-500">
                  Henüz üretim yapılmadı.
                </td>
              </tr>
            )}
            {sonUretimler.map((u) => (
              <tr key={u.id}>
                <td className="border p-2 text-center text-gray-500">{u.id}</td>
                <td className="border p-2">
                  {new Date(u.tarih).toLocaleDateString('tr-TR')}
                </td>
                <td className="border p-2">{u.depo_adi}</td>
                <td className="border p-2">{u.hammadde_adi}</td>
                <td className="border p-2 text-right">{Number(u.hammadde_miktar).toFixed(2)} kg</td>
                <td className="border p-2 text-right">{Number(u.mamul_toplam).toFixed(2)} kg</td>
                <td className="border p-2 text-right font-medium text-orange-700">
                  {Number(u.fire_miktar).toFixed(2)} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}