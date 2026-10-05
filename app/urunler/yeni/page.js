import Link from 'next/link';
import UrunForm from '@/components/urun/UrunForm';

export default function YeniUrunPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Yeni Ürün</h1>
                <Link href="/urunler" className="text-blue-600 hover:underline">
                    ← Ürünler
                </Link>
            </div>
            <UrunForm />
        </div>
    );
}