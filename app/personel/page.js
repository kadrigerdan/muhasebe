import Link from 'next/link';
import { tumPersonel, personelMaliOzet } from '@/models/personelModel';
import PersonelList from '@/components/personel/PersonelList';

export const dynamic = 'force-dynamic';

export default async function PersonelListPage() {
    const [personel, ozet] = await Promise.all([
        tumPersonel(),
        personelMaliOzet(),
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Personel</h1>
                <Link
                    href="/personel/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Yeni Personel
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Aktif Personel</div>
                    <div className="text-xl font-bold">{String(ozet.aktif_personel)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Pasif Personel</div>
                    <div className="text-xl font-bold">{String(ozet.pasif_personel)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Aylık Maaş Toplamı</div>
                    <div className="text-xl font-bold">
                        {Number(ozet.aylik_maas_toplam).toFixed(2)} ₺
                    </div>
                </div>
            </div>

            <PersonelList personel={personel} />
        </div>
    );
}