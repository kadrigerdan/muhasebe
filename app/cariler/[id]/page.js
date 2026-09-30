import { notFound } from 'next/navigation';
import { cariGetir } from '@/models/cariModel';
import CariForm from '@/components/cari/CariForm';

export const dynamic = 'force-dynamic';

export default async function CariDuzenlePage({ params }) {
    const p = await params;
    const id = Number(p.id);
    if (!id || Number.isNaN(id)) notFound();

    const cari = await cariGetir(id);
    if (!cari) notFound();

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Cari Düzenle</h1>
            <CariForm initial={cari} />
        </div>
    );
}