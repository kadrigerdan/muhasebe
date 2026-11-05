import Link from 'next/link';
import { paraFormat } from '@/lib/format';

export default function SatisFaturaList({ faturalar = [] }) {
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
          const iadeToplam = Number(f.iade_toplam ?? 0);
          const kalan = Math.max(0, toplam - odenen - iadeToplam);
          const arsivli = Number(f.arsivlendi) === 1;
          const iade = f.fatura_tipi === 'iade';


          return (
            <tr key={String(f.id)} className={arsivli ? 'bg-amber-50/40 text-gray-400' : ''}>
              <td className="border p-2">
                {String(f.id)}
                {iade && (
                  <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded align-middle">
                    ↩️ İade
                  </span>
                )}
                {!iade && Number(f.iade_sayisi) > 0 && (              // ← EKLE
                  <span className="ml-2 text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded align-middle">
                    ↩️ İade Kesilmiş ({String(f.iade_sayisi)})
                  </span>
                )}
                {arsivli && (
                  <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded align-middle">
                    🗄️ Arşiv
                  </span>
                )}
              </td>

              <td className="border p-2">{f.cari_unvan ?? '—'}</td>

              <td className="border p-2">
                {f.tarih ? new Date(f.tarih).toLocaleDateString('tr-TR') : '—'}
              </td>

              {/* TOPLAM — iade ise negatif ve mavi */}
              <td className={`border p-2 text-right ${iade ? 'text-red-700' : ''}`}>
                {iade ? '-' : ''}{paraFormat(toplam)} ₺
              </td>

              {/* TAHSİL — iade ise '—' */}
              <td className="border p-2 text-right text-green-700">
                {odenen > 0.01 ? paraFormat(odenen) + ' ₺' : '—'}
              </td>

              {/* KALAN — iade ise 'Alacak' */}
              <td
                className={`border p-2 text-right font-medium ${iade
                  ? 'text-blue-700'
                  : arsivli
                    ? 'text-gray-400'
                    : kalan > 0.01
                      ? 'text-red-700'
                      : 'text-gray-400'
                  }`}
              >
                {iade
                  ? (kalan > 0.01 ? `${paraFormat(kalan)} alacak` : '—')
                  : kalan > 0.01
                    ? paraFormat(kalan) + ' ₺'
                    : '—'}
              </td>

              {/* DURUM — iade ise 'İade' rozeti */}
              <td className="border p-2 text-center">
                {iade ? (
                  odenen >= toplam - 0.01 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      İade ✓ Ödendi
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      İade (Alacak)
                    </span>
                  )
                ) : arsivli ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    —
                  </span>
                ) : (
                  <>
                    {f.durum === 'odendi' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Ödendi</span>
                    )}
                    {f.durum === 'kismi' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Kısmi</span>
                    )}
                    {f.durum === 'odenmedi' && Number(f.tamamen_iade) === 1 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        İade ile Kapandı
                      </span>
                    )}
                    {f.durum === 'odenmedi' && Number(f.tamamen_iade) !== 1 && Number(f.iade_sayisi) > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        Kısmi İade
                      </span>
                    )}
                    {f.durum === 'odenmedi' && Number(f.tamamen_iade) !== 1 && Number(f.iade_sayisi) === 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Ödenmedi</span>
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
                {iade && f.kaynak_fatura_id && (
                  <Link
                    href={`/satis-faturalar/${f.kaynak_fatura_id}`}
                    className="text-amber-700 hover:underline text-xs"
                  >
                    ↩️ Kaynak #{f.kaynak_fatura_id}
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}