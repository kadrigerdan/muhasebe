import { musteriListesi } from '@/models/cariModel';
import { query } from '@/database/db';
import SatisFaturaForm from '@/components/satis-fatura/SatisFaturaForm';

export default async function YeniSatisFaturaPage() {
    const [cariler, urunler, depolar, stoklar] = await Promise.all([
        musteriListesi(),
        query('SELECT id, urun_adi, varsayilan_alis_fiyati, varsayilan_satis_fiyati, kritik_seviye FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
        query('SELECT id, ad FROM depolar ORDER BY id'),
        query('SELECT urun_id, depo_id, stok FROM urun_stok WHERE stok > 0'),
    ]);

    // Her ürün için depo bazlı stok haritası
    const stokMap = {};
    for (const s of stoklar) {
        if (!stokMap[s.urun_id]) stokMap[s.urun_id] = {};
        stokMap[s.urun_id][s.depo_id] = Number(s.stok);
    }

    const urunlerWithStok = urunler.map((u) => ({
        ...u,
        stoklar: stokMap[u.id] || {},
    }));

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Satış Faturası</h1>
            <SatisFaturaForm
                cariler={cariler}
                urunler={urunlerWithStok}
                depolar={depolar}
            />
        </div>
    );
}