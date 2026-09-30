import Link from 'next/link';
import SatisFaturaSilButton from './SatisFaturaSilButton';

export default function SatisFaturaList({ faturalar }) {
    return (
        <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">#</th>
                    <th className="border p-2 text-left">Müşteri</th>
                    <th className="border p-2 text-left">Tarih</th>
                    <th className="border p-2 text-center">Kalem</th>
                    <th className="border p-2 text-right">Toplam</th>
                    <th className="border p-2 text-left">İşlem</th>
                </tr>
            </thead>
            <tbody>
                {faturalar.length === 0 && (
                    <tr>
                        <td colSpan={6} className="border p-4 text-center text-gray-500">
                            Fatura yok.
                        </td>
                    </tr>
                )}
                {faturalar.map((f) => (
                    <tr key={String(f.id)}>
                        <td className="border p-2">{String(f.id)}</td>
                        <td className="border p-2">{f.cari_unvan}</td>
                        <td className="border p-2">
                            {new Date(f.tarih).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="border p-2 text-center">{String(f.kalem_sayisi)}</td>
                        <td className="border p-2 text-right">
                            {Number(f.toplam).toFixed(2)} ₺
                        </td>
                        <td className="border p-2 space-x-2">
                            <Link
                                href={`/satis-faturalar/${f.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                Detay
                            </Link>
                            <SatisFaturaSilButton id={Number(f.id)} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}