import Link from 'next/link';
import { ayarlariGetir } from '@/models/ayarlarModel';
import AyarlarForm from '@/components/ayarlar/AyarlarForm';

export const dynamic = 'force-dynamic';

export default async function AyarlarPage() {
  const ayarlar = await ayarlariGetir();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">⚙️ Ayarlar</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Ana Sayfa
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💡 Buradaki bilgiler <b>fişlerde ve faturalarda</b> görünür.
      </div>

      <AyarlarForm initial={ayarlar} />
    </div>
  );
}
