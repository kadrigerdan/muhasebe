import { notFound } from 'next/navigation';
import { personelGetir } from '@/models/personelModel';
import PersonelForm from '@/components/personel/PersonelForm';

export const dynamic = 'force-dynamic';

export default async function PersonelDuzenlePage({ params }) {
    const p = await params;
    const id = Number(p.id);
    if (!id || Number.isNaN(id)) notFound();

    const personel = await personelGetir(id);
    if (!personel) notFound();

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                Personel Düzenle — {personel.ad} {personel.soyad}
            </h1>
            <PersonelForm initial={personel} />
        </div>
    );
}