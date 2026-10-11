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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👤 Kullanıcılar</h1>
        <Link
          href="/kullanicilar/yeni"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Yeni Kullanıcı
        </Link>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ad Soyad</th>
            <th className="border p-2 text-left">Kullanıcı Adı</th>
            <th className="border p-2 text-center">Rol</th>
            <th className="border p-2 text-center">Durum</th>
            <th className="border p-2 text-left">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {kullanicilar.map((k) => (
            <tr key={String(k.id)}>
              <td className="border p-2 font-medium">{k.ad_soyad}</td>
              <td className="border p-2 font-mono text-xs">{k.kullanici_adi}</td>
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
              <td className="border p-2">
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
  );
}
