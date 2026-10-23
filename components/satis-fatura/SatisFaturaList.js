import Link from 'next/link';
import { paraFormat } from '@/lib/format';

export default function SatisFaturaList({ faturalar }) {


  return (
    <table className="w-full border-collapse border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 text-left">#</th>
          <th className="border p-2 text-left">Müşteri</th>
          <th className="border p-2 text-left">Tarih</th>
          <th className="border p-2 text-right">Toplam</th>
          <th className="border p-2 text-right">Tahsil</th>
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
          const arsivli = Number(f.arsivlendi) === 1;

          return (
            <tr
              key={String(f.id)}
              className={arsivli ? 'bg-amber-50/40 text-gray-400' : ''}
            >
              <td className="border p-2">
                {String(f.id)}
                {arsivli && (
                  <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded align-middle">
                    🗄️ Arşiv
                  </span>
                )}
              </td>
              <td className="border p-2">{f.cari_unvan}</td>
              <td className="border p-2">
                {new Date(f.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2 text-right">
                {paraFormat(toplam)} ₺
              </td>
              <td className={`border p-2 text-right ${arsivli ? '' : 'text-green-700'}`}>
                {paraFormat(odenen)} ₺
              </td>
              <td className={`border p-2 text-right font-medium ${arsivli
                ? 'text-gray-400'
                : kalan > 0.01 ? 'text-red-700' : 'text-gray-400'
                }`}>
                {kalan > 0.01 ? paraFormat(kalan) + ' ₺' : '—'}
              </td>
              <td className="border p-2 text-center">
                {arsivli ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    —
                  </span>
                ) : (
                  <>
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
                  </>
                )}
              </td>
              <td className="border p-2 space-x-2 whitespace-nowrap">
                <Link
                  href={`/satis-faturalar/${f.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Detay
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}