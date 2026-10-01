import { notFound } from 'next/navigation';
import Link from 'next/link';
import { personelGetir, personelOdemeleri, personelOdemeOzet } from '@/models/personelModel';
import OdemeForm from '@/components/personel/OdemeForm';
import { aktifKasaHesaplari } from '@/models/kasaModel';

export const dynamic = 'force-dynamic';

export default async function PersonelOdemelerPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const personel = await personelGetir(id);
  if (!personel) notFound();

  const [odemeler, ozet, kasaHesaplari] = await Promise.all([
    personelOdemeleri(id),
    personelOdemeOzet(id),
    aktifKasaHesaplari(),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Ödemeler — {personel.ad} {personel.soyad}
        </h1>
        <Link href="/personel" className="text-blue-600 hover:underline">
          ← Personel
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Ödenen</div>
          <div className="text-xl font-bold">
            {Number(ozet.toplam_odenen).toFixed(2)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Maaş</div>
          <div className="text-xl font-bold">
            {Number(ozet.toplam_maas).toFixed(2)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Avans</div>
          <div className="text-xl font-bold">
            {Number(ozet.toplam_avans).toFixed(2)} ₺
          </div>
        </div>
      </div>

      <OdemeForm personelId={id} kasaHesaplari={kasaHesaplari} />

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-left">Tip</th>
            <th className="border p-2 text-left">Dönem</th>
            <th className="border p-2 text-right">Tutar</th>
            <th className="border p-2 text-left">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {odemeler.length === 0 && (
            <tr>
              <td colSpan={5} className="border p-4 text-center text-gray-500">
                Ödeme kaydı yok.
              </td>
            </tr>
          )}
          {odemeler.map((o) => (
            <tr key={String(o.id)}>
              <td className="border p-2">
                {new Date(o.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2">
                <span className={`text-xs px-2 py-0.5 rounded ${o.odeme_tipi === 'maas' ? 'bg-blue-100 text-blue-700' :
                  o.odeme_tipi === 'avans' ? 'bg-yellow-100 text-yellow-700' :
                    o.odeme_tipi === 'prim' ? 'bg-green-100 text-green-700' :
                      o.odeme_tipi === 'kesinti' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                  }`}>
                  {o.odeme_tipi}
                </span>
              </td>
              <td className="border p-2">{o.donem ?? '-'}</td>
              <td className="border p-2 text-right font-medium">
                {Number(o.tutar).toFixed(2)} ₺
              </td>
              <td className="border p-2">{o.aciklama ?? '-'}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}