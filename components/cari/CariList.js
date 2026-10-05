import Link from 'next/link';
import { paraFormat } from '@/lib/format';

export default function CariList({ cariler }) {
  return (
    <table className="w-full border-collapse border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 text-left">Ünvan</th>
          <th className="border p-2 text-center">Tip</th>
          <th className="border p-2 text-left">Telefon</th>
          <th className="border p-2 text-right">Borç</th>
          <th className="border p-2 text-right">Alacak</th>
          <th className="border p-2 text-right">Bakiye</th>
          <th className="border p-2 text-left">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {cariler.length === 0 && (
          <tr>
            <td colSpan={7} className="border p-4 text-center text-gray-500">
              Cari yok.
            </td>
          </tr>
        )}
        {cariler.map((c) => {
          const bakiye = Number(c.bakiye);
          return (
            <tr key={String(c.id)}>
              <td className="border p-2">{c.unvan}</td>
              <td className="border p-2 text-center">
                {c.tip === 'tedarikci' && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    Tedarikçi
                  </span>
                )}
                {c.tip === 'musteri' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Müşteri
                  </span>
                )}
                {c.tip === 'her_ikisi' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    Her İkisi
                  </span>
                )}
              </td>
              <td className="border p-2">{c.telefon ?? '-'}</td>
              <td className="border p-2 text-right">
                {paraFormat(c.toplam_borc)} ₺
              </td>
              <td className="border p-2 text-right">
                {paraFormat(c.toplam_alacak)} ₺
              </td>
              <td
                className={`border p-2 text-right font-medium ${bakiye >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
              >
                {paraFormat(bakiye)} ₺
              </td>
              <td className="border p-2 space-x-2 whitespace-nowrap">
                <Link
                  href={`/cariler/${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Düzenle
                </Link>
                <Link
                  href={`/cariler/${c.id}/ekstre`}
                  className="text-purple-600 hover:underline"
                >
                  Ekstre
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}