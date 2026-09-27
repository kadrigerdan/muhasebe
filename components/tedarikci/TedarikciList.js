import Link from 'next/link';
import TedarikciDeleteButton from './TedarikciDeleteButton';

export default function TedarikciList({ tedarikciler }) {
    return (
        <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">#</th>
                    <th className="border p-2 text-left">Ünvan</th>
                    <th className="border p-2 text-left">Telefon</th>
                    <th className="border p-2 text-left">Adres</th>
                    <th className="border p-2 text-left">Kayıt</th>
                    <th className="border p-2 text-left">İşlem</th>
                </tr>
            </thead>
            <tbody>
                {tedarikciler.length === 0 && (
                    <tr>
                        <td colSpan={6} className="border p-4 text-center text-gray-500">
                            Kayıt yok.
                        </td>
                    </tr>
                )}
                {tedarikciler.map((t) => (
                    <tr key={String(t.id)}>
                        <td className="border p-2">{String(t.id)}</td>
                        <td className="border p-2">{t.unvan}</td>
                        <td className="border p-2">{t.telefon ?? '-'}</td>
                        <td className="border p-2 max-w-xs truncate">{t.adres ?? '-'}</td>
                        <td className="border p-2">
                            {t.created_at ? new Date(t.created_at).toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="border p-2 space-x-2">
                            <Link
                                href={`/tedarikciler/${t.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                Düzenle
                            </Link>
                            <TedarikciDeleteButton id={Number(t.id)} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}