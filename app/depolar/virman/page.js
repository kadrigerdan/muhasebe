import { query } from '@/database/db';
import VirmanForm from '@/components/depolar/VirmanForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VirmanPage() {
  const [depolar, urunler] = await Promise.all([
    query('SELECT id, ad FROM depolar ORDER BY id'),
    query('SELECT id, urun_adi FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Depo Virmanı</h1>
      <p className="text-sm text-gray-600 mb-4">
        Depolar arasında ürün transferi yapın. Örn: Kasap'tan Restoran'a kuşbaşı göndermek gibi.
      </p>
      <VirmanForm depolar={depolar} urunler={urunler} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Depo Virmanı</h1>
        <Link href="/depolar" className="text-blue-600 hover:underline text-sm">
          ← Depolar
        </Link>
      </div>
    </div>
  );
}