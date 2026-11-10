import { query } from '@/database/db';
import VirmanForm from '@/components/depolar/VirmanForm';

export const dynamic = 'force-dynamic';

export default async function VirmanPage() {
  const [depolar, urunler, stoklar] = await Promise.all([
    query('SELECT id, ad FROM depolar ORDER BY id'),
    query('SELECT id, urun_adi FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
    query('SELECT urun_id, depo_id, stok FROM urun_stok WHERE stok > 0'),
  ]);

  // Her ürün için depo bazlı stok haritası
  const stokMap = {};
  for (const s of stoklar) {
    if (!stokMap[s.urun_id]) stokMap[s.urun_id] = {};
    stokMap[s.urun_id][s.depo_id] = Number(s.stok);
  }

  const urunlerWithStok = urunler.map((u) => ({
    ...u,
    stoklar: stokMap[u.id] || {},
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Depo Virmanı</h1>
      <p className="text-sm text-gray-600 mb-4">
        Depolar arasında ürün transferi yapın. Örn: Kasap'tan Restoran'a kuşbaşı göndermek gibi.
      </p>
      <VirmanForm depolar={depolar} urunler={urunlerWithStok} />
    </div>
  );
}