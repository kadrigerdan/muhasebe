import Link from 'next/link';
import { tumUrunler, urunOzet } from '@/models/urunModel';
import UrunList from '@/components/urun/UrunList';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function UrunListPage() {
    const [urunler, ozet] = await Promise.all([tumUrunler(), urunOzet()]);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ürünler</h1>
                <Link href="/urunler/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Yeni Ürün
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Ürün</div>
                    <div className="text-xl font-bold">{String(ozet.toplam_urun)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Aktif</div>
                    <div className="text-xl font-bold text-green-700">{String(ozet.aktif_urun)}</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Stok Değeri (Alış)</div>
                    <div className="text-xl font-bold">
                        {paraFormat(ozet.stok_degeri_alis)} ₺
                    </div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Stok Değeri (Satış)</div>
                    <div className="text-xl font-bold text-blue-700">
                        {paraFormat(ozet.stok_degeri_satis)} ₺
                    </div>
                </div>
            </div>

            <UrunList urunler={urunler} />
        </div>
    );
}