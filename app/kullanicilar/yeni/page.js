import Link from 'next/link';
import { redirect } from 'next/navigation';
import { oturumAl } from '@/lib/auth';
import KullaniciForm from '@/components/kullanici/KullaniciForm';

export default async function YeniKullaniciPage() {
  const oturum = await oturumAl();
  if (!oturum || oturum.rol !== 'admin') redirect('/');

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeni Kullanıcı</h1>
        <Link href="/kullanicilar" className="text-blue-600 hover:underline">
          ← Kullanıcılar
        </Link>
      </div>
      <KullaniciForm />
    </div>
  );
}
