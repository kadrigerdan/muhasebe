import Link from 'next/link';
import { cariBakiyeListesi } from '@/models/cariModel';
import CariList from '@/components/cari/CariList';

export const dynamic = 'force-dynamic';

export default async function CariListPage() {

    const cariler = await cariBakiyeListesi();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cariler</h1>
                <Link
                    href="/cariler/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Yeni Cari
                </Link>
            </div>

            <CariList cariler={cariler} />
        </div>
    );
}