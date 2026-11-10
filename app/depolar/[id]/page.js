import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/database/db';

export const dynamic = 'force-dynamic';

export default async function DepoDetayPage({ params }) {
  const p = await params;
  const depoId = Number(p.id);
  if (!depoId) notFound();

  // Depo bilgisi
  const depoRows = await query('SELECT id, ad FROM depolar WHERE id = ?', [depoId]);
  if (!depoRows.length) notFound();
  const depo = depoRows[0];

  // Bu depodaki ürünler ve stokları
  const urunler = await query(`
        SELECT 
            us.stok,
            u.id AS urun_id,
            u.urun_adi,
            u.tip,
            u.kritik_seviye
        FROM urun_stok us
        JOIN urunler u ON u.id = us.urun_id
        WHERE us.depo_id = ?
        ORDER BY u.urun_adi
    `, [depoId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{depo.ad}</h1>
          <p className="text-sm text-gray-500">Depo #{depo.id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/depolar/virman"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            ↔️ Virman Yap
          </Link>
          <Link
            href="/depolar"
            className="text-blue-600 hover:underline self-center text-sm"
          >
            ← Depolar
          </Link>
        </div>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-center w-16">ID</th>
            <th className="border p-2 text-left">Ürün Adı</th>
            <th className="border p-2 text-center">Tip</th>
            <th className="border p-2 text-right">Stok</th>
            <th className="border p-2 text-right">Kritik Seviye</th>
            <th className="border p-2 text-center">Durum</th>
            <th className="border p-2 text-center w-24">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {urunler.length === 0 && (
            <tr>
              <td colSpan={7} className="border p-4 text-center text-gray-500">
                Bu depoda ürün yok.
              </td>
            </tr>
          )}
          {urunler.map((u) => {
            const stok = Number(u.stok);
            const kritik = u.kritik_seviye != null && stok <= Number(u.kritik_seviye);
            const tukenmis = stok <= 0;
            return (
              <tr key={u.urun_id}>
                <td className="border p-2 text-center text-gray-500">
                  {String(u.urun_id)}
                </td>
                <td className="border p-2">{u.urun_adi}</td>
                <td className="border p-2 text-center">{u.tip}</td>
                <td className={`border p-2 text-right font-medium ${tukenmis ? 'text-red-700' : kritik ? 'text-yellow-700' : ''
                  }`}>
                  {stok.toLocaleString('tr-TR')}
                </td>
                <td className="border p-2 text-right text-gray-500">
                  {u.kritik_seviye ?? '—'}
                </td>
                <td className="border p-2 text-center">
                  {tukenmis ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      🚫 Tükendi
                    </span>
                  ) : kritik ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      ⚠️ Kritik
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      ✓ Normal
                    </span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  {u.tip === 'hammadde' && stok > 0 ? (
                    <Link
                      href={`/depolar/uretim?hammadde_id=${u.urun_id}&miktar=${u.stok}`}
                      className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                      title="Bu ürünü işle"
                    >
                      🔪 İşle
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}