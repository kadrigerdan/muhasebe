import { redirect } from 'next/navigation';
import { oturumAl } from '@/lib/auth';
import SifreForm from '@/components/profil/SifreForm';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const oturum = await oturumAl();
  if (!oturum) redirect('/giris');

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">👤 Profilim</h1>

      {/* Bilgi Kartı */}
      <div className="border rounded-lg p-4 bg-white space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ad Soyad:</span>
          <span className="font-medium">{oturum.ad_soyad}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Kullanıcı Adı:</span>
          <span className="font-mono">{oturum.kullanici_adi}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Rol:</span>
          <span className="font-medium">
            {oturum.rol === 'admin' ? 'Yönetici' : 'Personel'}
          </span>
        </div>
      </div>

      {/* Şifre Değiştir */}
      <div className="border rounded-lg p-5 bg-white">
        <h2 className="font-bold mb-4">🔒 Şifre Değiştir</h2>
        <SifreForm />
      </div>
    </div>
  );
}
