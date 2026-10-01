import { notFound } from 'next/navigation';
import Link from 'next/link';
import { kasaGetir } from '@/models/kasaModel';
import KasaForm from '@/components/kasa/KasaForm';

export const dynamic = 'force-dynamic';

export default async function KasaDuzenlePage({ params }) {
    const p = await params;
    const id = Number(p.id);
    if (!id || Number.isNaN(id)) notFound();

    const kasa = await kasaGetir(id);
    if (!kasa) notFound();

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Kasa Düzenle — {kasa.ad}</h1>
                <Link href="/kasa" className="text-blue-600 hover:underline">
                    ← Kasa
                </Link>
            </div>
            <KasaForm initial={kasa} />
        </div>
    );
}