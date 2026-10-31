import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cariGetir, cariEkstre } from '@/models/cariModel';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CariEkstrePage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const cari = await cariGetir(id);
  if (!cari) notFound();

  const { hareketler, toplamBorc, toplamAlacak, bakiye } = await cariEkstre(id);

  const tipEtiket = {
    satis: 'Satış Fatura',
    satis_tahsilat: '💰 Satış Tahsilat',
    satis_iade: '↩️ Satış İade',
    satis_iade_odeme: '💸 Müşteriye İade Ödemesi',
    alis: 'Alış Fatura',
    alis_odeme: '💰 Alış Ödeme',
    alis_iade: '↩️ Alış İade',
    alis_iade_odeme: '💸 Alış İade Ödemesi',
  };

  const tipRenk = {
    alis: 'text-blue-700',
    alis_odeme: 'text-green-700',
    alis_iade: 'text-amber-700',
    alis_iade_odeme: 'text-purple-700',
    satis: 'text-blue-700',
    satis_tahsilat: 'text-green-700',
    satis_iade: 'text-amber-700',
    satis_iade_odeme: 'text-purple-700',
  };

  const faturaLinki = (h) => {
    if (h.tip === 'alis' || h.tip === 'alis_iade') {
      return (
        <Link href={`/alis-faturalar/${h.fatura_id}`} className="text-blue-600 hover:underline">
          Fatura #{String(h.fatura_id)}
        </Link>
      );
    }
    if (h.tip === 'satis' || h.tip === 'satis_iade') {
      return (
        <Link href={`/satis-faturalar/${h.fatura_id}`} className="text-blue-600 hover:underline">
          Fatura #{String(h.fatura_id)}
        </Link>
      );
    }
    if (
      h.tip === 'alis_odeme' ||
      h.tip === 'satis_tahsilat' ||
      h.tip === 'alis_iade_odeme' ||
      h.tip === 'satis_iade_odeme'
    ) {
      return <span className="text-gray-500 text-xs">Ödeme Kaydı</span>;
    }
    return '—';
  };

  const satirRenk = (tip) => {
    if (tip === 'alis_odeme' || tip === 'satis_tahsilat') return 'bg-blue-50';
    if (tip === 'alis_iade' || tip === 'satis_iade') return 'bg-amber-50';
    if (tip === 'alis_iade_odeme' || tip === 'satis_iade_odeme') return 'bg-purple-50';
    return '';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cari Ekstresi — {cari.unvan}</h1>
        <Link href="/cariler" className="text-blue-600 hover:underline">
          ← Cariler
        </Link>
      </div>

      {/* ÖZET KARTLARI */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">
            Toplam Borç
            <span className="block text-[10px]">(Ödediğimiz)</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {paraFormat(toplamBorc)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">
            Toplam Alacak
            <span className="block text-[10px]">(Aldığımız)</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            {paraFormat(toplamAlacak)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Net Bakiye</div>
          <div className={`text-xl font-bold ${Number(bakiye) > 0
              ? 'text-red-700'
              : Number(bakiye) < 0
                ? 'text-green-700'
                : 'text-gray-500'
            }`}>
            {Number(bakiye) === 0 ? '—' : paraFormat(bakiye) + ' ₺'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            {Number(bakiye) > 0
              ? '↑ karşı taraf bize borçlu'
              : Number(bakiye) < 0
                ? '↓ biz karşı tarafa borçluyuz'
                : 'hesap kapalı'}
          </div>
        </div>
      </div>

      {/* HAREKETLER TABLOSU */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-left">Tip</th>
            <th className="border p-2 text-left">Fatura</th>
            <th className="border p-2 text-right">
              Borç
              <div className="text-[10px] font-normal text-gray-500">(Ödediğimiz)</div>
            </th>
            <th className="border p-2 text-right">
              Alacak
              <div className="text-[10px] font-normal text-gray-500">(Aldığımız)</div>
            </th>
            <th className="border p-2 text-right">Bakiye</th>
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
          {hareketler.map((h, i) => (
            <tr key={i} className={satirRenk(h.tip)}>
              <td className="border p-2">
                {new Date(h.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className={`border p-2 ${tipRenk[h.tip] || ''}`}>
                {tipEtiket[h.tip] || h.tip}
              </td>
              <td className="border p-2">{faturaLinki(h)}</td>
              <td className="border p-2 text-right text-green-700">
                {Number(h.borc) > 0 ? paraFormat(h.borc) + ' ₺' : '—'}
              </td>
              <td className="border p-2 text-right text-blue-700">
                {Number(h.alacak) > 0 ? paraFormat(h.alacak) + ' ₺' : '—'}
              </td>
              <td className={`border p-2 text-right font-medium ${Number(h.bakiye) > 0
                  ? 'text-red-700'
                  : Number(h.bakiye) < 0
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}>
                {Number(h.bakiye) === 0 ? '—' : paraFormat(h.bakiye) + ' ₺'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}