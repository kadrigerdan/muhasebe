import Link from 'next/link';
import KasaForm from '@/components/kasa/KasaForm';

export default function YeniKasaPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Yeni Kasa</h1>
                <Link href="/kasa" className="text-blue-600 hover:underline">
                    ← Kasa
                </Link>
            </div>
            <KasaForm />
        </div>
    );
}