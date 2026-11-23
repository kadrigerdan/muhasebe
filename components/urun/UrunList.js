import Link from 'next/link';
import UrunSilButton from './UrunSilButton';
import { paraFormat } from '@/lib/format';

export default function UrunList({ urunler }) {
  return (
    <div className='overflow-x-auto'>
      <table className="w-full border-collapse border text-xs  ">
        <thead className="bg-gray-100 text-center">
          <tr>
            <th className="border ">#</th>
            <th className="border py-2 ">Ürün Adı</th>
            <th className="border py-2 ">Tip</th>
            <th className="border py-2 ">Alış Fiyatı</th>
            <th className="border py-2 ">Satış Fiyatı</th>
            <th className="border py-2 ">Kâr Marjı</th>
            <th className="border py-2 ">Stok</th>
            <th className="border py-2 ">Kritik</th>
            <th className="border py-2 ">Durum</th>
            <th className="border py-2">İşlem</th>
          </tr>
        </thead>

        <tbody>
          {urunler.length === 0 && (
            <tr>
              <td colSpan={10} className="border p-4 text-center text-gray-500">
                Ürün yok.
              </td>
            </tr>
          )}

          {urunler.map((u) => {
            const alis = Number(u.varsayilan_alis_fiyati);
            const satis = Number(u.varsayilan_satis_fiyati);
            const marj = alis > 0 ? ((satis - alis) / alis) * 100 : 0;
            const stokTakip = u.tip === 'hammadde';
            const kritikMi = stokTakip && Number(u.stok)
              <= Number(u.kritik_seviye);
            const tukendi = stokTakip && u.kritik_seviye !== null
              && Number(u.stok) <= 0;

            return (
              <tr
                key={String(u.id)}
                className={tukendi ? 'bg-red-50' : kritikMi ? 'bg-yellow-50' : ''}
              >
                {/* 1. ÜRÜN ID */}
                <td className="border p-2 text-center">
                  <a href={`/urunler/${u.id}`} className="text-blue-600 hover:underline">
                    {String(u.id)}
                  </a>
                </td>

                {/* 1. ÜRÜN ADI */}
                <td className="border p-2 font-medium">{u.urun_adi}</td>

                {/* 2. TİP — YENİ */}
                <td className="border p-1 md:p-2 text-xs md:text-sm text-center">
                  {u.tip === 'hammadde' && (
                    <span className="text-xs bg-gray-100 text-gray-700 py-0.5 rounded">
                      Ham Madde
                    </span>
                  )}
                  {u.tip === 'satis_urunu' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Satış Ürünü
                    </span>
                  )}
                </td>

                {/* 3. ALIŞ */}
                <td className="border p-2 text-center">{paraFormat(alis)} ₺</td>

                {/* 4. SATIŞ */}
                <td className="border p-2 text-center">{paraFormat(satis)} ₺</td>

                {/* 5. MARJ */}
                <td
                  className={`border p-2 text-center ${marj >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                >
                  {marj.toFixed(1)}%
                </td>

                {/* 6. STOK */}
                <td className="border p-2 text-center">
                  {u.depolar && u.depolar.length > 0 ? (
                    <div className="space-y-0.5">
                      {u.depolar.map((d, i) => (
                        <div key={i} className="text-xs wrap-break-word">
                          <span className="text-gray-600">{d.depo}:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {d.stok.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {/* 7. KRİTİK */}
                <td className="border p-2 text-center text-gray-500">
                  {String(u.kritik_seviye)}
                </td>

                {/* 8. DURUM */}
                <td className="border p-2 text-center">
                  {u.durum === 1 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      Pasif
                    </span>
                  )}
                </td>

                {/* 9. İŞLEM */}
                <td className="border p-2 space-x-2 ">
                  <Link href={`/urunler/${u.id}`} className="text-blue-600 hover:underline">
                    Düzenle
                  </Link>
                  <UrunSilButton id={Number(u.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
