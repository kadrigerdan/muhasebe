import Link from 'next/link';
import { tumSatisFaturalar, satisMaliOzet } from '@/models/satisFaturaModel';
import SatisFaturaList from '@/components/satis-fatura/SatisFaturaList';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaListPage() {
    const [faturalar, ozet] = await Promise.all([
        tumSatisFaturalar(),
        satisMaliOzet(),
    ]);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Satış Faturaları</h1>
                <Link
                    href="/satis-faturalar/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Yeni Satış Faturası
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Tutar</div>
                    <div className="text-xl font-bold">
                        {paraFormat(ozet.toplam_tutar)} ₺
                    </div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Fatura Sayısı</div>
                    <div className="text-xl font-bold">{String(ozet.fatura_sayisi)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Adet</div>
                    <div className="text-xl font-bold">{String(ozet.toplam_adet)}</div>
                </div>
            </div>

            <SatisFaturaList faturalar={faturalar} />
        </div>
    );
}