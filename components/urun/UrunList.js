import Link from 'next/link';
import UrunSilButton from './UrunSilButton';

export default function UrunList({ urunler }) {
    return (
        <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">Ürün Adı</th>
                    <th className="border p-2 text-right">Alış Fiyatı</th>
                    <th className="border p-2 text-right">Satış Fiyatı</th>
                    <th className="border p-2 text-right">Kâr Marjı</th>
                    <th className="border p-2 text-right">Stok</th>
                    <th className="border p-2 text-right">Kritik</th>
                    <th className="border p-2 text-center">Durum</th>
                    <th className="border p-2 text-left">İşlem</th>
                </tr>
            </thead>
            <tbody>
                {urunler.length === 0 && (
                    <tr>
                        <td colSpan={8} className="border p-4 text-center text-gray-500">
                            Ürün yok.
                        </td>
                    </tr>
                )}
                {urunler.map((u) => {
                    const alis = Number(u.varsayilan_alis_fiyati);
                    const satis = Number(u.varsayilan_satis_fiyati);
                    const marj = alis > 0 ? ((satis - alis) / alis) * 100 : 0;
                    const kritikMi = Number(u.stok) <= Number(u.kritik_seviye);
                    const tukendi = Number(u.stok) <= 0;

                    return (
                        <tr key={String(u.id)} className={tukendi ? 'bg-red-50' : kritikMi ? 'bg-yellow-50' : ''}>
                            <td className="border p-2 font-medium">{u.urun_adi}</td>
                            <td className="border p-2 text-right">{alis.toFixed(2)} ₺</td>
                            <td className="border p-2 text-right">{satis.toFixed(2)} ₺</td>
                            <td className={`border p-2 text-right ${marj >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {marj.toFixed(1)}%
                            </td>
                            <td className="border p-2 text-right font-medium">{String(u.stok)}</td>
                            <td className="border p-2 text-right text-gray-500">{String(u.kritik_seviye)}</td>
                            <td className="border p-2 text-center">
                                {u.durum === 1 ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Aktif</span>
                                ) : (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Pasif</span>
                                )}
                            </td>
                            <td className="border p-2 space-x-2 whitespace-nowrap">
                                <Link href={`/urunler/${u.id}`} className="text-blue-600 hover:underline">
                                    Düzenle
                                </Link>
                                <UrunSilButton id={Number(u.id)} />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}