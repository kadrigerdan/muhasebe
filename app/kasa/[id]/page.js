import { notFound } from 'next/navigation';
import Link from 'next/link';
import { kasaGetir, kasaEkstresi } from '@/models/kasaModel';
import HareketForm from '@/components/kasa/HareketForm';
import { paraFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function KasaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const kasa = await kasaGetir(id);
  if (!kasa) notFound();

  const ekstre = await kasaEkstresi(id, 200);

  const toplamGiris = ekstre
    .filter((h) => h.yon === 'giris')
    .reduce((s, h) => s + Number(h.tutar), 0);
  const toplamCikis = ekstre
    .filter((h) => h.yon === 'cikis')
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

      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Bakiye</div>
          <div className="text-2xl font-bold">
            {paraFormat(kasa.bakiye)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Giriş</div>
          <div className="text-xl font-bold text-green-700">
            +{paraFormat(toplamGiris)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Çıkış</div>
          <div className="text-xl font-bold text-red-700">
            -{paraFormat(toplamCikis)} ₺
          </div>
        </div>
      </div>

      <HareketForm kasaId={id} />

      {/* Birleşik Ekstre */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-left">Kaynak</th>
            <th className="border p-2 text-center">Tip</th>
            <th className="border p-2 text-right">Tutar</th>
            <th className="border p-2 text-left">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {ekstre.length === 0 && (
            <tr>
              <td colSpan={5} className="border p-4 text-center text-gray-500">
                Hareket yok.
              </td>
            </tr>
          )}
          {ekstre.map((h, i) => (
            <tr key={`${h.kaynak_tipi}-${h.kaynak_id}-${i}`}>
              <td className="border p-2">
                {new Date(h.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="border p-2 text-xs text-gray-600">
                {h.kaynak_tipi === 'manuel' && 'Manuel'}
                {h.kaynak_tipi === 'personel_odeme' && 'Personel'}
                {h.kaynak_tipi === 'fatura_alis' && 'Alış Fatura'}
                {h.kaynak_tipi === 'fatura_satis' && 'Satış Fatura'}
              </td>
              <td className="border p-2 text-center">
                {h.yon === 'giris' ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Giriş
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Çıkış
                  </span>
                )}
              </td>
              <td className={`border p-2 text-right font-medium ${h.yon === 'giris' ? 'text-green-700' : 'text-red-700'
                }`}>
                {h.yon === 'giris' ? '+' : '-'}
                {paraFormat(h.tutar)} ₺
              </td>
              <td className="border p-2">{h.aciklama ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}