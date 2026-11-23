import { tedarikciListesi } from '@/models/cariModel';
import { query } from '@/database/db';
import AlisFaturaForm from '@/components/alis-fatura/AlisFaturaForm';


export default async function YeniAlisFaturaPage({ searchParams }) {
    const params = await searchParams;
    // Hepsi paralel çalışsın diye Promise.all kullanıyoruz
    const [cariler, urunler, depolar, stoklar] = await Promise.all([
        tedarikciListesi(),
        query('SELECT id, urun_adi, varsayilan_alis_fiyati, varsayilan_satis_fiyati, kritik_seviye FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
        query('SELECT id, ad FROM depolar ORDER BY id'),
        query('SELECT urun_id, depo_id, stok FROM urun_stok WHERE stok > 0'),
    ]);
    const depoId = params.depo_id ? Number(params.depo_id) : null;

    // Her ürün için depo bazlı stok haritası
    const stokMap = {};
    for (const s of stoklar) {
        if (!stokMap[s.urun_id]) stokMap[s.urun_id] = {};
        stokMap[s.urun_id][s.depo_id] = Number(s.stok);
    }

    const urunlerStoklu = urunler.map((u) => ({
        ...u,
        stoklar: stokMap[u.id] || {},
    }));

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Alış Faturası</h1>
            <AlisFaturaForm
                cariler={cariler}
                urunler={urunlerStoklu}
                depolar={depolar}
                depoId={depoId}
            />
        </div>
    );
}