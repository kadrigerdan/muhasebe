import { notFound } from 'next/navigation';
import Link from 'next/link';
import { satisFaturaGetir } from '@/models/satisFaturaModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import TahsilatForm from '@/components/satis-fatura/TahsilatForm';
import { paraFormat } from '@/lib/format';
import ArsivleButonu from '@/components/ArsivleButonu';
import { satisFaturaArsivleAction } from '@/actions/satisFaturaActions';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await satisFaturaGetir(id);
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
    kismi: 'Kısmi',
    odendi: 'Ödendi',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Satış Faturası #{String(fatura.id)}</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <ArsivleButonu id={fatura.id} action={satisFaturaArsivleAction} />
          <Link
            href={`/satis-faturalar/${id}/yazdir`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            🖨️ Yazdır / PDF
          </Link>
          <Link
            href={`/satis-faturalar/${id}/fis`}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            🧾 Fiş (80mm)
          </Link>
          <Link href="/satis-faturalar" className="text-blue-600 hover:underline self-center text-sm">
            ← Faturalar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border rounded p-4">
        <div><b>Müşteri:</b> {fatura.cari_unvan}</div>
        <div><b>Tarih:</b> {new Date(fatura.tarih).toLocaleDateString('tr-TR')}</div>
        <div><b>Toplam:</b> {paraFormat(toplam)} ₺</div>
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

      <TahsilatForm faturaId={id} kalan={kalan} kasaHesaplari={kasaHesaplari} />

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ürün</th>
            <th className="border p-2 text-right">Adet</th>
            <th className="border p-2 text-right">Birim Fiyat</th>
            <th className="border p-2 text-right">Satır Toplam</th>
          </tr>
        </thead>
        <tbody>
          {fatura.kalemler.map((k) => {
            const satir = Number(k.adet) * Number(k.birim_fiyat);
            return (
              <tr key={String(k.id)}>
                <td className="border p-2">{k.urun_adi}</td>
                <td className="border p-2 text-right">{String(k.adet)}</td>
                <td className="border p-2 text-right">{paraFormat(k.birim_fiyat)} ₺</td>
                <td className="border p-2 text-right">{paraFormat(satir)} ₺</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}