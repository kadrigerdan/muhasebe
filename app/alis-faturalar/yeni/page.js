import { tedarikciListesi } from '@/models/cariModel';
import { query } from '@/database/db';
import AlisFaturaForm from '@/components/alis-fatura/AlisFaturaForm';

export default async function YeniAlisFaturaPage() {
    const cariler = await tedarikciListesi();
    const urunler = await query(
        'SELECT id, urun_adi, stok, varsayilan_alis_fiyati FROM urunler WHERE durum = 1 ORDER BY urun_adi'
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Alış Faturası</h1>
            <AlisFaturaForm cariler={cariler} urunler={urunler} />
        </div>
    );
}