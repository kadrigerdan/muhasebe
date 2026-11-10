import Link from 'next/link';
import { tumUrunler, urunOzet } from '@/models/urunModel';
import { query } from '@/database/db';
import UrunList from '@/components/urun/UrunList';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function UrunListPage() {
    const [urunler, ozet, depoStoklari] = await Promise.all([
        tumUrunler(),
        urunOzet(),
        query(`
            SELECT us.urun_id, d.ad AS depo_adi, us.stok
              FROM urun_stok us
              JOIN depolar d ON d.id = us.depo_id
             WHERE us.stok > 0
             ORDER BY d.id
        `),
    ]);

    // Ürünlere depo stoklarını ekle
    const depoMap = {};
    for (const ds of depoStoklari) {
        if (!depoMap[ds.urun_id]) depoMap[ds.urun_id] = [];
        depoMap[ds.urun_id].push({
            depo: ds.depo_adi,
            stok: Number(ds.stok),
        });
    }

    const urunlerWithStok = urunler.map((u) => ({
        ...u,
        depolar: depoMap[u.id] || [],
    }));

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ürünler</h1>
                <Link
                    href="/urunler/yeni"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
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

            <UrunList urunler={urunlerWithStok} />
        </div>
    );
}