import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  personelGetir, personelOdemeleri, personelOdemeOzet,
  personelDonemOzeti,
} from '@/models/personelModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import OdemeForm from '@/components/personel/OdemeForm';
import OdemeSilButton from '@/components/personel/OdemeSilButton';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function PersonelOdemelerPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const personel = await personelGetir(id);
  if (!personel) notFound();

  const [odemeler, ozet, donemOzeti, kasaHesaplari] = await Promise.all([
    personelOdemeleri(id),
    personelOdemeOzet(id),
    personelDonemOzeti(id),
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

      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Aylık Maaş</div>
          <div className="text-xl font-bold">
            {paraFormat(personel.maas)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Ödenen</div>
          <div className="text-xl font-bold text-blue-700">
            {paraFormat(ozet.toplam_odenen)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Avans</div>
          <div className="text-xl font-bold text-yellow-700">
            {paraFormat(ozet.toplam_avans)} ₺
          </div>
        </div>
      </div>

      {/* Dönem Bazlı Bakiye */}
      {personel.maas > 0 && (
        <div className="border rounded p-4 bg-white">
          <h2 className="font-bold mb-3">Dönem Bazlı Bakiye</h2>
          <p className="text-xs text-gray-500 mb-3">
            Hak ediş = aylık maaş + prim + ikramiye. Avans ve maaş ödemeleri düşülür.
          </p>
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Dönem</th>
                <th className="border p-2 text-right">Hak Ediş</th>
                <th className="border p-2 text-right">Ödenen</th>
                <th className="border p-2 text-right">Kalan</th>
                <th className="border p-2 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {donemOzeti.length === 0 && (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    Henüz ödeme yok.
                  </td>
                </tr>
              )}
              {donemOzeti.map((d) => (
                <tr key={d.donem}>
                  <td className="border p-2 font-medium">{d.donem}</td>
                  <td className="border p-2 text-right">
                    {paraFormat(d.hak_edis)} ₺
                  </td>
                  <td className="border p-2 text-right">
                    {paraFormat(d.toplam_odenen)} ₺
                  </td>
                  <td className={`border p-2 text-right font-bold ${Number(d.kalan) > 0.01 ? 'text-red-700' : 'text-green-700'
                    }`}>
                    {paraFormat(d.kalan)} ₺
                  </td>
                  <td className="border p-2 text-center">
                    {d.durum === 'odendi' ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Ödendi
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Eksik
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni Ödeme Formu */}
      <OdemeForm personelId={id} kasaHesaplari={kasaHesaplari} />

      {/* Ödeme Geçmişi */}
      <div>
        <h2 className="font-bold mb-3">Ödeme Geçmişi</h2>
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Tarih</th>
              <th className="border p-2 text-left">Tip</th>
              <th className="border p-2 text-left">Dönem</th>
              <th className="border p-2 text-right">Tutar</th>
              <th className="border p-2 text-left">Açıklama</th>
              <th className="border p-2 text-center">Kasa</th>
              <th className="border p-2 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {odemeler.length === 0 && (
              <tr>
                <td colSpan={7} className="border p-4 text-center text-gray-500">
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
                  {paraFormat(o.tutar)} ₺
                </td>
                <td className="border p-2">{o.aciklama ?? '-'}</td>
                <td className="border p-2 text-center text-xs">
                  {o.kasadan_dus === 1 ? (
                    <span className="text-green-700">✓ Kasadan</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <OdemeSilButton id={Number(o.id)} personelId={id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}