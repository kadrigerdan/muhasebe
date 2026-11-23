import Link from 'next/link';
import PersonelSilButton from './PersonelSilButton';
import { paraFormat } from '@/lib/format';

export default function PersonelList({ personel }) {

  return (
    <div className='min-w-0 overflow-x-auto'>
      <table className="w-full border-collapse border text-sm sm:text-xs ">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-left">Ad Soyad</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-left ">Görev</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-left">Departman</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center ">Telefon</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-right w-20 sm:w-24">Maaş</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center ">İşe Giriş</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center w-16">Durum</th>
            <th className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center ">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {personel.length === 0 && (
            <tr>
              <td colSpan={8} className="border p-4 text-center text-gray-500">
                Personel yok.
              </td>
            </tr>
          )}
          {personel.map((p) => (
            <tr key={String(p.id)}>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 font-medium truncate" title={`${p.ad} ${p.soyad}`}>
                {p.ad} {p.soyad}
              </td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 ">{p.gorev ?? '-'}</td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 ">{p.departman ?? '-'}</td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1  text-center">{p.telefon ?? '-'}</td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 text-right whitespace-nowrap">
                {paraFormat(p.maas)} ₺
              </td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center">
                {new Date(p.ise_giris_tarihi).toLocaleDateString('tr-TR')}
              </td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center">
                {p.aktif === 1
                  ? <span className="text-[9px] sm:text-xs bg-green-100 text-green-700 px-1 sm:px-2 py-0.5 rounded whitespace-nowrap">Aktif</span>
                  : <span className="text-[9px] sm:text-xs bg-gray-100 text-gray-700 px-1 sm:px-2 py-0.5 rounded whitespace-nowrap">Pasif</span>}
              </td>
              <td className="border px-1 py-0.5 sm:px-2 sm:py-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Link href={`/personel/${p.id}`}
                    className="text-blue-600 hover:underline text-[10px] sm:text-xs" title="Düzenle">
                    <span className="">✏️</span>  <span className="">Düzenle</span>
                  </Link>
                  <Link href={`/personel/${p.id}/odemeler`}
                    className="text-purple-600 hover:underline text-[10px] sm:text-xs" title="Ödemeler">
                    <span className="">💰</span>  <span className="">Ödemeler</span>
                  </Link>
                  <PersonelSilButton id={Number(p.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}