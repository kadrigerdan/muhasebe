import Link from 'next/link';
import { query } from '@/database/db';
import { fireRaporu, fireOzet } from '@/models/fireRaporModel';
import { paraFormat, sayiFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function FireRaporPage({ searchParams }) {
  const sp = await searchParams;
  const baslangic = sp?.baslangic || '';
  const bitis = sp?.bitis || '';
  const depo_id = sp?.depo_id ? Number(sp.depo_id) : null;

  const [depolar, kayitlar, ozet] = await Promise.all([
    query('SELECT id, ad FROM depolar ORDER BY id'),
    fireRaporu({ baslangic, bitis, depo_id }),
    fireOzet({ baslangic, bitis, depo_id }),
  ]);

  // Depo bazlı toplamlar
  const depoToplam = {};
  for (const k of kayitlar) {
    if (!depoToplam[k.depo_adi]) {
      depoToplam[k.depo_adi] = { kg: 0, deger: 0, adet: 0 };
    }
    depoToplam[k.depo_adi].kg += Number(k.miktar);
    depoToplam[k.depo_adi].deger += Number(k.fire_degeri);
    depoToplam[k.depo_adi].adet += 1;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔥 Fire Raporu</h1>
          <p className="text-sm text-gray-500">
            Kemik, sinir, atılacak kısımlar ve zayiler
          </p>
        </div>
        <Link href="/depolar" className="text-blue-600 hover:underline text-sm">
          ← Depolar
        </Link>
      </div>

      {/* Filtre */}
      <form method="GET" className="border rounded-lg p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç</label>
            <input
              type="date"
              name="baslangic"
              defaultValue={baslangic}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bitiş</label>
            <input
              type="date"
              name="bitis"
              defaultValue={bitis}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Depo</label>
            <select
              name="depo_id"
              defaultValue={depo_id || ''}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tüm Depolar</option>
              {depolar.map((d) => (
                <option key={d.id} value={d.id}>{d.ad}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Filtrele
            </button>
          </div>
        </div>
        {(baslangic || bitis || depo_id) && (
          <div className="mt-3 text-sm">
            <Link href="/depolar/fire" className="text-blue-600 hover:underline">
              ✕ Filtreleri temizle
            </Link>
          </div>
        )}
      </form>

      {/* Özet Kartları */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-4 bg-orange-50">
          <div className="text-xs text-orange-800">Toplam Fire</div>
          <div className="text-2xl font-bold text-orange-900">
            {sayiFormat(ozet.toplam_kg)} kg
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-red-50">
          <div className="text-xs text-red-800">Fire Değeri</div>
          <div className="text-2xl font-bold text-red-900">
            {paraFormat(ozet.toplam_deger)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-gray-100">
          <div className="text-xs text-gray-600">Kayıt Sayısı</div>
          <div className="text-2xl font-bold">{sayiFormat(ozet.kayit_sayisi)}</div>
        </div>
      </div>

      {/* Depo Bazlı Özet */}
      {Object.keys(depoToplam).length > 1 && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-3">Depo Bazlı Fire</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(depoToplam).map(([depo, veri]) => (
              <div key={depo} className="border rounded p-3">
                <div className="text-sm font-medium">{depo}</div>
                <div className="text-lg font-bold text-orange-700">
                  {sayiFormat(veri.kg)} kg
                </div>
                <div className="text-xs text-gray-500">
                  {paraFormat(veri.deger)} ₺ • {veri.adet} kayıt
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detay Tablosu */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-center w-16">#</th>
              <th className="border p-2 text-left">Tarih</th>
              <th className="border p-2 text-left">Depo</th>
              <th className="border p-2 text-left">Hammadde</th>
              <th className="border p-2 text-right">Fire (kg)</th>
              <th className="border p-2 text-right">Değer</th>
              <th className="border p-2 text-center">Üretim #</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 && (
              <tr>
                <td colSpan={7} className="border p-6 text-center text-gray-500">
                  Bu filtreye uygun fire kaydı yok.
                </td>
              </tr>
            )}
            {kayitlar.map((k) => (
              <tr key={k.id}>
                <td className="border p-2 text-center text-gray-500">{k.id}</td>
                <td className="border p-2">
                  {new Date(k.tarih).toLocaleDateString('tr-TR')}
                </td>
                <td className="border p-2">{k.depo_adi}</td>
                <td className="border p-2">{k.urun_adi}</td>
                <td className="border p-2 text-right font-medium text-orange-700">
                  {sayiFormat(k.miktar)} kg
                </td>
                <td className="border p-2 text-right text-red-700">
                  {paraFormat(k.fire_degeri)} ₺
                </td>
                <td className="border p-2 text-center">
                  {k.uretim_id ? (
                    <Link
                      href={`/depolar/uretim`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      #{k.uretim_id}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}