import { notFound } from 'next/navigation';
import { tedarikciGetir } from '@/models/tedarikci';
import TedarikciForm from '@/components/tedarikci/TedarikciForm';

export default async function DuzenlePage({ params }) {
    const tedarikci = await tedarikciGetir(Number(params.id));
    if (!tedarikci) notFound();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tedarikçi Düzenle</h1>
            <TedarikciForm initial={tedarikci} />
        </div>
    );
}