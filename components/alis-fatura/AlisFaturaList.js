import Link from 'next/link';
import AlisFaturaSilButton from './AlisFaturaSilButton';
import { paraFormat } from '@/lib/format';

export default function AlisFaturaList({ faturalar }) {
  return (
    <table className="w-full border-collapse border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 text-left">#</th>
          <th className="border p-2 text-left">Tedarikçi</th>
          <th className="border p-2 text-left">Tarih</th>
          <th className="border p-2 text-right">Toplam</th>
          <th className="border p-2 text-right">Ödenen</th>
          <th className="border p-2 text-right">Kalan</th>
          <th className="border p-2 text-center">Durum</th>
          <th className="border p-2 text-left">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {faturalar.length === 0 && (
          <tr>
            <td colSpan={8} className="border p-4 text-center text-gray-500">
              Fatura yok.
            </td>
          </tr>
        )}
        {faturalar.map((f) => {
          const toplam = Number(f.toplam);
          const odenen = Number(f.odenen_tutar ?? 0);
          const kalan = toplam - odenen;
          return (
            <tr key={String(f.id)}>
              <td className="border p-2">{String(f.id)}</td>
              <td className="border p-2">{f.cari_unvan}</td>
              <td className="border p-2">
                {new Date(f.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2 text-right">
                {paraFormat(toplam)} ₺
              </td>
              <td className="border p-2 text-right text-green-700">
                {paraFormat(odenen)} ₺
              </td>
              <td className={`border p-2 text-right font-medium ${kalan > 0.01 ? 'text-red-700' : 'text-gray-400'
                }`}>
                {kalan > 0.01 ? paraFormat(kalan) + ' ₺' : '—'}
              </td>
              <td className="border p-2 text-center">
                {f.durum === 'odendi' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Ödendi
                  </span>
                )}
                {f.durum === 'kismi' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    Kısmi
                  </span>
                )}
                {f.durum === 'odenmedi' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Ödenmedi
                  </span>
                )}
              </td>
              <td className="border p-2 space-x-2 whitespace-nowrap">
                <Link
                  href={`/alis-faturalar/${f.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Detay
                </Link>
                <AlisFaturaSilButton id={Number(f.id)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}