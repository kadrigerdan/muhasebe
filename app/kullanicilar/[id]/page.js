import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { oturumAl } from '@/lib/auth';
import { kullaniciGetir } from '@/models/kullaniciModel';
import KullaniciForm from '@/components/kullanici/KullaniciForm';

export const dynamic = 'force-dynamic';

export default async function KullaniciDuzenlePage({ params }) {
  const oturum = await oturumAl();
  if (!oturum || oturum.rol !== 'admin') redirect('/');

  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const kullanici = await kullaniciGetir(id);
  if (!kullanici) notFound();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kullanıcı Düzenle</h1>
        <Link href="/kullanicilar" className="text-blue-600 hover:underline">
          ← Kullanıcılar
        </Link>
      </div>
      <KullaniciForm initial={kullanici} />
    </div>
  );
}
