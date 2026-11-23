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
        <div className="p-2 max-w-6xl mx-auto space-y-2">
            <div className="flex items-center justify-around  p-4 ">
                <h1 className="text-2xl font-bold">Ürünler</h1>
                <Link
                    href="/urunler/yeni"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    + Yeni Ürün
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4  gap-2 text-center text-black">
                <div className="border rounded p-2 bg-white">
                    <div className="text-md ">Toplam Ürün</div>
                    <div className="text-base font-bold">{String(ozet.toplam_urun)}</div>
                </div>
                <div className="border rounded p-2 bg-white">
                    <div className="text-md ">Aktif</div>
                    <div className="text-base font-bold text-green-700">{String(ozet.aktif_urun)}</div>
                </div>
                <div className="border rounded p-2 bg-white">
                    <div className="text-base">Stok Değeri (Alış)</div>
                    <div className="text-base sm:text-md md:text-lg font-bold text-blue-700">
                        {paraFormat(ozet.stok_degeri_alis)} ₺
                    </div>
                </div>
                <div className="border rounded p-2 bg-white">
                    <div className="text-base">Stok Değeri (Satış)</div>
                    <div className="text-base sm:text-md md:text-lg font-bold text-blue-700">
                        {paraFormat(ozet.stok_degeri_satis)} ₺
                    </div>
                </div>
            </div>

            <UrunList urunler={urunlerWithStok} />
        </div>
    );
}