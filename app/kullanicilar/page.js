import Link from 'next/link';
import { redirect } from 'next/navigation';
import { tumKullanicilar } from '@/models/kullaniciModel';
import { oturumAl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function KullanicilarPage() {
  const oturum = await oturumAl();
  if (!oturum || oturum.rol !== 'admin') redirect('/');

  const kullanicilar = await tumKullanicilar();

  return (
    <div className="p-2  space-y-6">
      <div className="grid items-center justify-center">
        <div className='flex flex-wrap items-center justify-around gap-2 min-[750px]:gap-14'>
          <h1 className="text-2xl font-bold block">Kullanıcılar</h1>
          <div className='flex flex-wrap items-center justify-around gap-2 min-[750px]:gap-14'>
            <h1 className="text-2xl font-bold">👤 </h1>
            <Link
              href="/kullanicilar/yeni"
              className="bg-blue-600 text-white px-10 py-1 rounded hover:bg-blue-700 text-xl font-bold "
            >
              + Yeni Kullanıcı
            </Link>
          </div>
        </div>
      </div>

      <div className='w-full overflow-x-auto'>
        <table className="w-full border-collapse border text-sm ">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 ">Ad Soyad</th>
              <th className="border p-2 ">Kullanıcı Adı</th>
              <th className="border p-2 ">Rol</th>
              <th className="border p-2 ">Durum</th>
              <th className="border p-2 ">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => (
              <tr key={String(k.id)} className=''>
                <td className="border p-2 font-medium text-center">{k.ad_soyad}</td>
                <td className="border p-2 font-mono text-xs text-center">{k.kullanici_adi}</td>
                <td className="border p-2 text-center">
                  {k.rol === 'admin' ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Yönetici
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Personel
                    </span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  {k.aktif === 1 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      Pasif
                    </span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <Link
                    href={`/kullanicilar/${k.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
