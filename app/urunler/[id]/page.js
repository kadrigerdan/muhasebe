import { notFound } from 'next/navigation';
import Link from 'next/link';
import { urunGetir } from '@/models/urunModel';
import UrunForm from '@/components/urun/UrunForm';
import { query } from "@/database/db"

export const dynamic = 'force-dynamic';

export default async function UrunDuzenlePage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const urun = await urunGetir(id);
  if (!urun) notFound();

  const stoklar = await query(
    `SELECT us.stok AS miktar, d.ad AS depo_adi
     FROM urun_stok us
     LEFT JOIN depolar d ON d.id = us.depo_id
     WHERE us.urun_id = ?`,
    [id]
  );

  const mevcut_stok = stoklar.reduce((t, s) =>
    t + Number(s.miktar ?? 0), 0);

  const initial = {
    ...urun,
    mevcut_stok,
    depolar: stoklar.map(s => ({
      depo_adi: s.depo_adi ?? '-',
      miktar: Number(s.miktar ?? 0),
    })),
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ürün Düzenle — {urun.urun_adi}</h1>
        <Link href="/urunler" className="text-blue-600 hover:underline">
          ← Ürünler
        </Link>
      </div>
      <UrunForm initial={initial} />
    </div>
  );
}
