import Link from 'next/link';
import { tumAlisFaturalar, alisMaliOzet } from '@/models/alisFaturaModel';
import AlisFaturaList from '@/components/alis-fatura/AlisFaturaList';

export const dynamic = 'force-dynamic';

export default async function AlisFaturaListPage() {
    const [faturalar, ozet] = await Promise.all([
        tumAlisFaturalar(),
        alisMaliOzet(),
    ]);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Alış Faturaları</h1>
                <Link
                    href="/alis-faturalar/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Yeni Alış Faturası
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Tutar</div>
                    <div className="text-xl font-bold">
                        {Number(ozet.toplam_tutar).toFixed(2)} ₺
                    </div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Fatura Sayısı</div>
                    <div className="text-xl font-bold">{String(ozet.fatura_sayisi)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Miktar</div>
                    <div className="text-xl font-bold">{String(ozet.toplam_miktar)}</div>
                </div>
            </div>

            <AlisFaturaList faturalar={faturalar} />
        </div>
    );
}