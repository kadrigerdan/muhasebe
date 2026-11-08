import { musteriListesi } from '@/models/cariModel';
import { query } from '@/database/db';
import SatisFaturaForm from '@/components/satis-fatura/SatisFaturaForm';

export default async function YeniSatisFaturaPage() {
    const [cariler, urunler, depolar] = await Promise.all([
        musteriListesi(),
        query('SELECT id, urun_adi, stok, varsayilan_alis_fiyati, varsayilan_satis_fiyati FROM urunler WHERE durum = 1 ORDER BY urun_adi'),
        query('SELECT id, ad FROM depolar ORDER BY id'),
    ]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Satış Faturası</h1>
            <SatisFaturaForm
                cariler={cariler}
                urunler={urunler}
                depolar={depolar}
            />
        </div>
    );
}