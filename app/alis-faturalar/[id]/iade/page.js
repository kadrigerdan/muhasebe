import { notFound } from 'next/navigation';
import Link from 'next/link';
import { alisFaturaGetir, alisFaturaIadeEdilebilir } from '@/models/alisFaturaModel';
import AlisIadeForm from '@/components/alis-fatura/AlisIadeForm';

export const dynamic = 'force-dynamic';

export default async function AlisIadePage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await alisFaturaGetir(id);
  if (!fatura) notFound();

  if (fatura.fatura_tipi === 'iade') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded">
          İade faturasının iadesi yapılamaz.{' '}
          <Link href={`/alis-faturalar/${id}`} className="underline">Faturaya dön</Link>
        </div>
      </div>
    );
  }

  const kalemler = await alisFaturaIadeEdilebilir(id);
  const iadeEdilebilirVar = kalemler.some((k) => Number(k.iade_edilebilir) > 0);

  if (!iadeEdilebilirVar) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-slate-50 border p-4 rounded">
          Bu faturadaki tüm kalemler zaten iade edilmiş.{' '}
          <Link href={`/alis-faturalar/${id}`} className="underline">Faturaya dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">↩️ Alış İadesi — Fatura #{fatura.id}</h1>
      <div className="text-sm text-gray-600">
        Tedarikçi: <b>{fatura.cari_unvan}</b> · Orijinal Tarih:{' '}
        {new Date(fatura.tarih).toLocaleDateString('tr-TR')}
      </div>
      <AlisIadeForm
        kaynakFaturaId={id}
        kalemler={kalemler}
        varsayilanTarih={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}