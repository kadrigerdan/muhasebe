import Link from 'next/link';
import {
  kapananAdisyonlar,
  donemOzet,
  enCokSatanlar,
  fireOzet,
} from '@/models/adisyonModel';
import { paraFormat, sayiFormat } from '@/lib/format';

export const dynamic = 'force-dynamic';

function bugunTR() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${g}`;
}

export default async function RestoranRaporPage({ searchParams }) {
  const sp = await searchParams;
  const baslangic = sp?.baslangic || bugunTR();
  const bitis = sp?.bitis || bugunTR();

  const [adisyonlar, ozet, enCokSatan, fireData] = await Promise.all([
    kapananAdisyonlar({ baslangic, bitis }),
    donemOzet({ baslangic, bitis }),
    enCokSatanlar({ baslangic, bitis, limit: 10 }),
    fireOzet({ baslangic, bitis }),
  ]);

  const odemeToplam =
    Number(ozet.nakit) + Number(ozet.kredi_karti) +
    Number(ozet.pos) + Number(ozet.iban);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Restoran Raporu</h1>
        <Link href="/restoran" className="text-blue-600 hover:underline text-sm">
          ← Masalar
        </Link>
      </div>

      <form method="GET" className="bg-gray-50 border rounded-lg p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Başlangıç</label>
          <input type="date" name="baslangic" defaultValue={baslangic}
            className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Bitiş</label>
          <input type="date" name="bitis" defaultValue={bitis}
            className="border rounded px-3 py-2" />
        </div>
        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Filtrele
        </button>
        <Link href="/restoran/rapor" className="border rounded px-3 py-2 hover:bg-white text-sm">
          Bugün
        </Link>
      </form>

      {Number(fireData.adet) > 0 && (
        <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50">
          <div className="text-sm text-red-800">
            ⚠️ <b>Fire:</b> {sayiFormat(fireData.adet)} kalem •{' '}
            {sayiFormat(fireData.toplam)} adet
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-xs text-gray-500 mb-1">Adisyon Sayısı</div>
          <div className="text-2xl font-bold">{sayiFormat(ozet.adisyon_sayisi)}</div>
        </div>
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-xs text-green-600 mb-1">Toplam Ciro</div>
          <div className="text-2xl font-bold text-green-700">
            {paraFormat(ozet.toplam_ciro)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="text-xs text-blue-600 mb-1">Ortalama Hesap</div>
          <div className="text-2xl font-bold text-blue-700">
            {paraFormat(ozet.ortalama_hesap)} ₺
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-gray-100">
          <div className="text-xs text-gray-600 mb-1">Ödeme Toplamı</div>
          <div className="text-2xl font-bold">{paraFormat(odemeToplam)} ₺</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-bold mb-3">Ödeme Yöntemi Dağılımı</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">💵 Nakit</div>
            <div className="text-lg font-bold">{paraFormat(ozet.nakit)} ₺</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">💳 Kredi Kartı</div>
            <div className="text-lg font-bold">{paraFormat(ozet.kredi_karti)} ₺</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">📟 POS</div>
            <div className="text-lg font-bold">{paraFormat(ozet.pos)} ₺</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">🏦 IBAN</div>
            <div className="text-lg font-bold">{paraFormat(ozet.iban)} ₺</div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-bold mb-3">En Çok Satan Ürünler</h2>
        {enCokSatan.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">Bu dönemde satış yok.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left w-12">#</th>
                <th className="border p-2 text-left">Ürün</th>
                <th className="border p-2 text-right">Adet</th>
                <th className="border p-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {enCokSatan.map((u, i) => (
                <tr key={i}>
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2 font-medium">{u.urun_adi}</td>
                  <td className="border p-2 text-right font-bold">
                    {sayiFormat(u.toplam_adet)}
                  </td>
                  <td className="border p-2 text-right">
                    {paraFormat(u.toplam_tutar)} ₺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-bold mb-3">
          Kapanan Adisyonlar ({adisyonlar.length})
        </h2>
        {adisyonlar.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            Bu dönemde kapanan adisyon yok.
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Masa</th>
                <th className="border p-2 text-left">Kapanış</th>
                <th className="border p-2 text-left">Ödeme</th>
                <th className="border p-2 text-right">Tutar</th>
                <th className="border p-2 text-left">Kasa</th>
              </tr>
            </thead>
            <tbody>
              {adisyonlar.map((a) => (
                <tr key={String(a.id)}>
                  <td className="border p-2">{String(a.id)}</td>
                  <td className="border p-2 font-medium">
                    {a.masa_ad}
                    {a.masa_tip === 'paket' && ' 🥡'}
                    {a.masa_tip === 'gelal' && ' 🛍️'}
                    {a.masa_tip === 'masa' && ' 🍽️'}
                  </td>
                  <td className="border p-2 text-xs">
                    {new Date(a.kapanis_tarih).toLocaleString('tr-TR')}
                  </td>
                  <td className="border p-2 text-xs">
                    {a.odeme_yontemi === 'nakit' && '💵 Nakit'}
                    {a.odeme_yontemi === 'kredi_karti' && '💳 Kredi'}
                    {a.odeme_yontemi === 'pos' && '📟 POS'}
                    {a.odeme_yontemi === 'iban' && '🏦 IBAN'}
                  </td>
                  <td className="border p-2 text-right font-bold">
                    {paraFormat(a.toplam)} ₺
                  </td>
                  <td className="border p-2 text-xs text-blue-600">
                    {a.kasa_ad || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
