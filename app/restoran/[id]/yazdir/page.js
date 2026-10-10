import { notFound } from 'next/navigation';
import { adisyonGetir } from '@/models/adisyonModel';
import { ayarlariGetir } from '@/models/ayarlarModel';
import { paraFormat } from '@/lib/format';
import YazdirButonu from '@/components/fatura/YazdirButonu';

export const dynamic = 'force-dynamic';

export default async function AdisyonYazdirPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const [adisyon, ayarlar] = await Promise.all([
    adisyonGetir(id),
    ayarlariGetir(),
  ]);
  if (!adisyon) notFound();

  const tarih = new Date(adisyon.acilis_tarih);

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden p-4 border-b bg-gray-50 flex justify-between items-center">
        <a href={`/restoran/${id}`} className="text-blue-600 hover:underline">
          ← Masaya Dön
        </a>
        <YazdirButonu />
      </div>

      <div className="max-w-3xl mx-auto p-8">
        {/* Başlık */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <div className="text-2xl font-bold">
            {ayarlar.sirket_adi || 'ŞİRKET ADI'}
          </div>
          {ayarlar.adres && (
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {ayarlar.adres}
            </div>
          )}
          <div className="text-sm text-gray-600 mt-1">
            {ayarlar.telefon && <>Tel: {ayarlar.telefon}</>}
            {ayarlar.telefon && ayarlar.vergi_no && ' • '}
            {ayarlar.vergi_no && <>Vergi No: {ayarlar.vergi_no}</>}
          </div>
        </div>

        {/* Adisyon Bilgisi */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xl font-bold">
              {adisyon.masa_ad}
              {adisyon.masa_tip === 'paket' && ' (Paket)'}
              {adisyon.masa_tip === 'gelal' && ' (Gel-Al)'}
            </div>
            <div className="text-sm text-gray-600">
              Adisyon #{String(adisyon.id)}
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{tarih.toLocaleDateString('tr-TR')}</div>
            <div>
              {tarih.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Ürünler */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 text-sm">Ürün</th>
              <th className="text-right py-2 text-sm w-16">Adet</th>
              <th className="text-right py-2 text-sm w-24">Fiyat</th>
              <th className="text-right py-2 text-sm w-24">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {adisyon.kalemler.map((k) => (
              <tr key={String(k.id)} className="border-b border-gray-200">
                <td className="py-2 text-sm">{k.urun_adi}</td>
                <td className="py-2 text-sm text-right">{String(k.adet)}</td>
                <td className="py-2 text-sm text-right">
                  {paraFormat(k.birim_fiyat)} ₺
                </td>
                <td className="py-2 text-sm text-right font-medium">
                  {paraFormat(k.toplam)} ₺
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Toplam */}
        <div className="flex justify-end border-t-2 border-gray-800 pt-3">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span className="font-bold text-lg">TOPLAM:</span>
              <span className="font-bold text-lg">
                {paraFormat(adisyon.toplam)} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Alt Not */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
          <div className="font-medium whitespace-pre-line">
            {ayarlar.fis_alt_not || 'Afiyet olsun! 🍽️'}
          </div>
        </div>
      </div>
    </div>
  );
}
