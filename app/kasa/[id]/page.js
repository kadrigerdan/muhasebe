import { notFound } from 'next/navigation';
import Link from 'next/link';
import { kasaGetir, kasaHareketleri } from '@/models/kasaModel';
import HareketForm from '@/components/kasa/HareketForm';
import HareketSilButton from '@/components/kasa/HareketSilButton';

export const dynamic = 'force-dynamic';

export default async function KasaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const kasa = await kasaGetir(id);
  if (!kasa) notFound();

  const hareketler = await kasaHareketleri(id, 200);

  const toplamGiris = hareketler
    .filter((h) => h.tip === 'giris')
    .reduce((s, h) => s + Number(h.tutar), 0);
  const toplamCikis = hareketler
    .filter((h) => h.tip === 'cikis')
    .reduce((s, h) => s + Number(h.tutar), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kasa.ad}</h1>
          <div className="text-sm text-gray-500">
            {kasa.tip === 'nakit' && 'Nakit Kasa'}
            {kasa.tip === 'banka' && `Banka${kasa.banka_adi ? ' — ' + kasa.banka_adi : ''}`}
            {kasa.tip === 'pos' && 'POS'}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/kasa/hesaplar/${kasa.id}`}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Düzenle
          </Link>
          <Link href="/kasa" className="text-blue-600 hover:underline self-center">
            ← Kasa
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Bakiye</div>
          <div className="text-2xl font-bold">
            {Number(kasa.bakiye).toFixed(2)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Giriş (son 200)</div>
          <div className="text-xl font-bold text-green-700">
            +{toplamGiris.toFixed(2)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Çıkış (son 200)</div>
          <div className="text-xl font-bold text-red-700">
            -{toplamCikis.toFixed(2)} ₺
          </div>
        </div>
      </div>

      <HareketForm kasaId={id} />

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-center">Tip</th>
            <th className="border p-2 text-right">Tutar</th>
            <th className="border p-2 text-left">Kaynak</th>
            <th className="border p-2 text-left">Açıklama</th>
            <th className="border p-2 text-center">İşlem</th>
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
          {hareketler.map((h) => (
            <tr key={String(h.id)}>
              <td className="border p-2">
                {new Date(h.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2 text-center">
                {h.tip === 'giris' ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Giriş
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Çıkış
                  </span>
                )}
              </td>
              <td
                className={`border p-2 text-right font-medium ${h.tip === 'giris' ? 'text-green-700' : 'text-red-700'
                  }`}
              >
                {h.tip === 'giris' ? '+' : '-'}
                {Number(h.tutar).toFixed(2)} ₺
              </td>
              <td className="border p-2 text-xs text-gray-600">
                {h.kaynak_tipi}
                {h.kaynak_id ? ` #${h.kaynak_id}` : ''}
              </td>
              <td className="border p-2">{h.aciklama ?? '-'}</td>
              <td className="border p-2 text-center">
                <HareketSilButton id={Number(h.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}