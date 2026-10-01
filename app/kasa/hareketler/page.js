import Link from 'next/link';
import { tumKasaHareketleri } from '@/models/kasaModel';
import { tumKasaHesaplari } from '@/models/kasaModel';

export const dynamic = 'force-dynamic';

export default async function KasaHareketleriPage({ searchParams }) {
  const sp = await searchParams;
  const kasaId = sp?.kasa ? Number(sp.kasa) : null;
  const tip = sp?.tip || null;

  const [hareketler, hesaplar] = await Promise.all([
    tumKasaHareketleri({ kasaId, tip }),
    tumKasaHesaplari(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kasa Hareketleri</h1>
        <Link href="/kasa" className="text-blue-600 hover:underline">
          ← Kasa
        </Link>
      </div>

      {/* Filtreler */}
      <form method="GET" className="flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Kasa</label>
          <select name="kasa" defaultValue={kasaId ?? ''}
            className="border rounded px-3 py-2">
            <option value="">Tümü</option>
            {hesaplar.map((k) => (
              <option key={k.id} value={k.id}>{k.ad}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tip</label>
          <select name="tip" defaultValue={tip ?? ''}
            className="border rounded px-3 py-2">
            <option value="">Tümü</option>
            <option value="giris">Giriş</option>
            <option value="cikis">Çıkış</option>
          </select>
        </div>
        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Filtrele
        </button>
        <Link href="/kasa/hareketler" className="text-gray-600 hover:underline px-4 py-2">
          Temizle
        </Link>
      </form>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-left">Kasa</th>
            <th className="border p-2 text-center">Tip</th>
            <th className="border p-2 text-right">Tutar</th>
            <th className="border p-2 text-left">Kaynak</th>
            <th className="border p-2 text-left">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {hareketler.length === 0 && (
            <tr>
              <td colSpan={6} className="border p-4 text-center text-gray-500">
                Hareket yok.
              </td>
            </tr>
          )}
          {hareketler.map((h) => (
            <tr key={String(h.id)}>
              <td className="border p-2">
                {new Date(h.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2">
                <Link href={`/kasa/${h.kasa_id}`}
                  className="text-blue-600 hover:underline">
                  {h.kasa_ad}
                </Link>
              </td>
              <td className="border p-2 text-center">
                {h.tip === 'giris'
                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Giriş</span>
                  : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Çıkış</span>}
              </td>
              <td className={`border p-2 text-right font-medium ${h.tip === 'giris' ? 'text-green-700' : 'text-red-700'
                }`}>
                {h.tip === 'giris' ? '+' : '-'}
                {Number(h.tutar).toFixed(2)} ₺
              </td>
              <td className="border p-2 text-xs text-gray-600">
                {h.kaynak_tipi}
                {h.kaynak_id ? ` #${h.kaynak_id}` : ''}
              </td>
              <td className="border p-2">{h.aciklama ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}