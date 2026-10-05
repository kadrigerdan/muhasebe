import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cariGetir, cariEkstre } from '@/models/cariModel';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CariEkstrePage({ params }) {
    const p = await params;
    const id = Number(p.id);
    if (!id || Number.isNaN(id)) notFound();

    const cari = await cariGetir(id);
    if (!cari) notFound();

    const { hareketler, toplamBorc, toplamAlacak, bakiye } = await cariEkstre(id);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cari Ekstresi — {cari.unvan}</h1>
                <Link href="/cariler" className="text-blue-600 hover:underline">
                    ← Cariler
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Borç</div>
                    <div className="text-xl font-bold">{paraFormat(toplamBorc)} ₺</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Toplam Alacak</div>
                    <div className="text-xl font-bold">{paraFormat(toplamAlacak)} ₺</div>
                </div>
                <div className="border rounded p-3 bg-white">
                    <div className="text-xs text-gray-500">Net Bakiye</div>
                    <div className={`text-xl font-bold ${bakiye >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {paraFormat(bakiye)} ₺
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left">Tarih</th>
                        <th className="border p-2 text-left">Tip</th>
                        <th className="border p-2 text-left">Fatura</th>
                        <th className="border p-2 text-right">Borç</th>
                        <th className="border p-2 text-right">Alacak</th>
                        <th className="border p-2 text-right">Bakiye</th>
                    </tr>
                </thead>
                <tbody>
                    {hareketler.length === 0 && (
                        <tr>
                            <td colSpan={6} className="border p-4 text-center text-gray-500">
                                Hareket yok.
                            </td>
                        </tr>
                    )}
                    {hareketler.map((h, i) => (
                        <tr key={i}>
                            <td className="border p-2">
                                {new Date(h.tarih).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="border p-2">
                                {h.tip === 'alis' ? 'Alış' : 'Satış'}
                            </td>
                            <td className="border p-2">
                                <Link
                                    href={h.tip === 'alis' ? `/alis-faturalar/${h.fatura_id}` : `/satis-faturalar/${h.fatura_id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    #{String(h.fatura_id)}
                                </Link>
                            </td>
                            <td className="border p-2 text-right">
                                {Number(h.borc) > 0 ? paraFormat(h.borc) + ' ₺' : '-'}
                            </td>
                            <td className="border p-2 text-right">
                                {Number(h.alacak) > 0 ? paraFormat(h.alacak) + ' ₺' : '-'}
                            </td>
                            <td className="border p-2 text-right font-medium">
                                {paraFormat(h.bakiye)} ₺
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}