import { notFound } from 'next/navigation';
import { satisFaturaGetir } from '@/models/satisFaturaModel';
import { paraFormat } from '@/lib/format';
import YazdirButonu from '@/components/fatura/YazdirButonu';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaYazdirPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await satisFaturaGetir(id);
  if (!fatura) notFound();

  const toplam = Number(fatura.toplam);
  const odenen = Number(fatura.odenen_tutar ?? 0);
  const kalan = toplam - odenen;

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden p-4 border-b bg-gray-50 flex justify-between items-center">
        <a href={`/satis-faturalar/${id}`} className="text-blue-600 hover:underline">
          ← Faturaya Dön
        </a>
        <YazdirButonu />
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">SATIŞ FATURASI</h1>
            <div className="text-sm text-gray-600 mt-1">Fatura No: #{String(fatura.id)}</div>
            <div className="text-sm text-gray-600">
              Tarih: {new Date(fatura.tarih).toLocaleDateString('tr-TR')}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">ŞİRKET ADI</div>
            <div className="text-xs text-gray-600">Adres satırı</div>
            <div className="text-xs text-gray-600">Telefon: 000 000 00 00</div>
            <div className="text-xs text-gray-600">Vergi No: 0000000000</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase text-gray-500 mb-1">Sayın</div>
          <div className="font-bold text-lg">{fatura.cari_unvan}</div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 text-sm">Ürün</th>
              <th className="text-right py-2 text-sm w-20">Adet</th>
              <th className="text-right py-2 text-sm w-28">Birim Fiyat</th>
              <th className="text-right py-2 text-sm w-32">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {fatura.kalemler.map((k) => {
              const satir = Number(k.adet) * Number(k.birim_fiyat);
              return (
                <tr key={String(k.id)} className="border-b border-gray-200">
                  <td className="py-2 text-sm">{k.urun_adi}</td>
                  <td className="py-2 text-sm text-right">{String(k.adet)}</td>
                  <td className="py-2 text-sm text-right">{paraFormat(k.birim_fiyat)} ₺</td>
                  <td className="py-2 text-sm text-right font-medium">{paraFormat(satir)} ₺</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm">
              <span>Toplam:</span>
              <span>{paraFormat(toplam)} ₺</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Ödenen:</span>
              <span>{paraFormat(odenen)} ₺</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold">
              <span>Kalan:</span>
              <span>{paraFormat(kalan)} ₺</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 text-xs text-gray-500 text-center">
          Bu fatura bilgilendirme amaçlıdır.
        </div>
      </div>
    </div>
  );
}
