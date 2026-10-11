import { notFound } from 'next/navigation';
import Link from 'next/link';
import { alisFaturaGetir } from '@/models/alisFaturaModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import OdemeForm from '@/components/alis-fatura/OdemeForm';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AlisFaturaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await alisFaturaGetir(id);
  if (!fatura) notFound();

  const kasaHesaplari = await aktifKasaHesaplari();

  const toplam = Number(fatura.toplam);
  const odenen = Number(fatura.odenen_tutar ?? 0);
  const kalan = toplam - odenen;

  const durumRenk = {
    odenmedi: 'bg-red-100 text-red-700',
    kismi: 'bg-yellow-100 text-yellow-700',
    odendi: 'bg-green-100 text-green-700',
  };
  const durumEtiket = {
    odenmedi: 'Ödenmedi',
    kismi: 'Kısmi Ödendi',
    odendi: 'Ödendi',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alış Faturası #{String(fatura.id)}</h1>
        <div className="flex gap-2">
          <Link
            href={`/alis-faturalar/${id}/yazdir`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            🖨️ Yazdır / PDF
          </Link>
          <Link
            href={`/alis-faturalar/${id}/fis`}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            🧾 Fiş (80mm)
          </Link>
          <Link href="/alis-faturalar" className="text-blue-600 hover:underline self-center">
            ← Faturalar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border rounded p-4">
        <div><b>Tedarikçi:</b> {fatura.cari_unvan}</div>
        <div><b>Tarih:</b> {new Date(fatura.tarih).toLocaleDateString('tr-TR')}</div>
        <div><b>Toplam:</b> {paraFormat(toplam)} ₺</div>
        <div><b>Ödenen:</b> {paraFormat(odenen)} ₺</div>
        <div>
          <b>Kalan:</b>{' '}
          <span className={kalan > 0.01 ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
            {paraFormat(kalan)} ₺
          </span>
        </div>
        <div>
          <b>Durum:</b>{' '}
          <span className={`text-xs px-2 py-0.5 rounded ${durumRenk[fatura.durum] || 'bg-gray-100'}`}>
            {durumEtiket[fatura.durum] || fatura.durum}
          </span>
        </div>
      </div>

      <OdemeForm faturaId={id} kalan={kalan} kasaHesaplari={kasaHesaplari} />

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ürün</th>
            <th className="border p-2 text-right">Miktar</th>
            <th className="border p-2 text-right">Birim Fiyat</th>
            <th className="border p-2 text-right">Satır Toplam</th>
          </tr>
        </thead>
        <tbody>
          {fatura.kalemler.map((k) => {
            const satir = Number(k.miktar) * Number(k.birim_fiyat);
            return (
              <tr key={String(k.id)}>
                <td className="border p-2">{k.urun_adi}</td>
                <td className="border p-2 text-right">{String(k.miktar)}</td>
                <td className="border p-2 text-right">
                  {paraFormat(k.birim_fiyat)} ₺
                </td>
                <td className="border p-2 text-right">{paraFormat(satir)} ₺</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}