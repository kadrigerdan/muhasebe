import { yedekListesiAction } from '@/actions/yedeklemeActions';
import YedekAlButton from '@/components/yedekleme/YedekAlButton';
import TamYedekAlButton from '@/components/yedekleme/TamYedekAlButton';
import YedekSilButton from '@/components/yedekleme/YedekSilButton';
import YedekIndirButton from '@/components/yedekleme/YedekIndirButton';

export const dynamic = 'force-dynamic';

function boyutFormat(bayt) {
    if (bayt < 1024) return bayt + ' B';
    if (bayt < 1024 * 1024) return (bayt / 1024).toFixed(1) + ' KB';
    return (bayt / 1024 / 1024).toFixed(2) + ' MB';
}

export default async function YedeklemePage() {
    const yedekler = await yedekListesiAction();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Yedekleme</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Sadece DB veya tam yedek (DB + kod) alabilirsiniz. Yedekler{' '}
                    <code>database/backups/</code> klasöründe saklanır.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TamYedekAlButton />
                <YedekAlButton />
            </div>

            <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left">Dosya</th>
                        <th className="border p-2 text-left">Tarih</th>
                        <th className="border p-2 text-right">Boyut</th>
                        <th className="border p-2 text-center">İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {yedekler.length === 0 && (
                        <tr>
                            <td colSpan={4} className="border p-6 text-center text-gray-500">
                                Henüz yedek yok.
                            </td>
                        </tr>
                    )}
                    {yedekler.map((y) => (
                        <tr key={y.ad}>
                            <td className="border p-2 font-mono text-xs">{y.ad}</td>
                            <td className="border p-2">
                                {new Date(y.tarih).toLocaleString('tr-TR')}
                            </td>
                            <td className="border p-2 text-right">{boyutFormat(y.boyut)}</td>
                            <td className="border p-2 text-center space-x-3">
                                <YedekIndirButton dosya={y.ad} />
                                <YedekSilButton dosya={y.ad} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border rounded p-4 bg-yellow-50 text-yellow-800 text-sm">
                <div className="font-semibold mb-1">⚠️ Önemli</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>Yedekleri düzenli olarak bilgisayarınıza indirin.</li>
                    <li>Sunucu çökerse yedekler de kaybolur — dış disk veya buluta kopyalayın.</li>
                    <li>
                        Geri yükleme: phpMyAdmin → <b>muhasebe</b> seç → <b>İçe Aktar</b> → SQL dosyasını seç.
                    </li>
                    <li>
                        Tam yedek (zip) başka bilgisayarda: aç → <code>yarn install</code> → SQL import →{' '}
                        <code>.env.local</code> düzenle → <code>yarn dev</code>.
                    </li>
                </ul>
            </div>
        </div>
    );
}