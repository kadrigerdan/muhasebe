import { notFound } from 'next/navigation';
import Link from 'next/link';
import { satisFaturaGetir } from '@/models/satisFaturaModel';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaDetayPage({ params }) {
    // Next.js 15 uyumu: params Promise'tir, await şart
    const p = await params;
    const id = Number(p.id);

    if (!id || Number.isNaN(id)) notFound();

    const fatura = await satisFaturaGetir(id);
    if (!fatura) notFound();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Satış Faturası #{String(fatura.id)}</h1>
                <Link href="/satis-faturalar" className="text-blue-600 hover:underline">
                    ← Satış Faturaları
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 border rounded p-4">
                <div><b>Müşteri:</b> {fatura.cari_unvan}</div>
                <div><b>Tarih:</b> {new Date(fatura.tarih).toLocaleDateString('tr-TR')}</div>
                <div><b>Toplam:</b> {fatura.toplam.toFixed(2)} ₺</div>
            </div>

            <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left">Ürün</th>
                        <th className="border p-2 text-right">Adet</th>
                        <th className="border p-2 text-right">Birim Fiyat</th>
                        <th className="border p-2 text-right">Satır Toplam</th>
                    </tr>
                </thead>
                <tbody>
                    {fatura.kalemler.map((k) => {
                        const satir = Number(k.adet) * Number(k.birim_fiyat);
                        return (
                            <tr key={String(k.id)}>
                                <td className="border p-2">{k.urun_adi}</td>
                                <td className="border p-2 text-right">{String(k.adet)}</td>
                                <td className="border p-2 text-right">
                                    {Number(k.birim_fiyat).toFixed(2)} ₺
                                </td>
                                <td className="border p-2 text-right">{satir.toFixed(2)} ₺</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}