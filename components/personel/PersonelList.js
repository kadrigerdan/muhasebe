import Link from 'next/link';
import PersonelSilButton from './PersonelSilButton';

export default function PersonelList({ personel }) {

    return (
        <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">Ad Soyad</th>
                    <th className="border p-2 text-left">Görev</th>
                    <th className="border p-2 text-left">Departman</th>
                    <th className="border p-2 text-left">Telefon</th>
                    <th className="border p-2 text-right">Maaş</th>
                    <th className="border p-2 text-left">İşe Giriş</th>
                    <th className="border p-2 text-center">Durum</th>
                    <th className="border p-2 text-left">İşlem</th>
                </tr>
            </thead>
            <tbody>
                {personel.length === 0 && (
                    <tr>
                        <td colSpan={8} className="border p-4 text-center text-gray-500">
                            Personel yok.
                        </td>
                    </tr>
                )}
                {personel.map((p) => (
                    <tr key={String(p.id)}>
                        <td className="border p-2 font-medium">
                            {p.ad} {p.soyad}
                        </td>
                        <td className="border p-2">{p.gorev ?? '-'}</td>
                        <td className="border p-2">{p.departman ?? '-'}</td>
                        <td className="border p-2">{p.telefon ?? '-'}</td>
                        <td className="border p-2 text-right">
                            {Number(p.maas).toFixed(2)} ₺
                        </td>
                        <td className="border p-2">
                            {new Date(p.ise_giris_tarihi).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="border p-2 text-center">
                            {p.aktif === 1
                                ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Aktif</span>
                                : <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Pasif</span>}
                        </td>
                        <td className="border p-2 space-x-2 whitespace-nowrap">
                            <Link href={`/personel/${p.id}`}
                                className="text-blue-600 hover:underline">
                                Düzenle
                            </Link>
                            <Link href={`/personel/${p.id}/odemeler`}
                                className="text-purple-600 hover:underline">
                                Ödemeler
                            </Link>
                            <PersonelSilButton id={Number(p.id)} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}