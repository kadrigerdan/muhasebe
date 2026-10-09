import { notFound } from 'next/navigation';
import Link from 'next/link';
import { adisyonGetir } from '@/models/adisyonModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import { query } from '@/database/db';
import UrunButonlari from '@/components/restoran/UrunButonlari';
import SiparisListesi from '@/components/restoran/SiparisListesi';

export const dynamic = 'force-dynamic';

export default async function SiparisSayfasi({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const adisyon = await adisyonGetir(id);
  if (!adisyon) notFound();
  if (adisyon.durum !== 'acik') {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
          Bu adisyon zaten kapatılmış.
        </div>
        <Link href="/restoran" className="text-blue-600 hover:underline">
          ← Restoran
        </Link>
      </div>
    );
  }

  const [urunler, kasaHesaplari] = await Promise.all([
    query(
      `SELECT id, urun_adi, varsayilan_satis_fiyati
         FROM urunler
        WHERE durum = 1 AND tip = 'satis_urunu'
        ORDER BY urun_adi`
    ),
    aktifKasaHesaplari(),
  ]);

  const acilis = new Date(adisyon.acilis_tarih);
  const sure = Math.floor((Date.now() - acilis.getTime()) / 60000);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Üst Başlık */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {adisyon.masa_ad}
            {adisyon.masa_tip === 'paket' && ' 🥡'}
            {adisyon.masa_tip === 'gelal' && ' 🛍️'}
            {adisyon.masa_tip === 'masa' && ' 🍽️'}
          </h1>
          <div className="text-sm text-gray-500">
            Adisyon #{String(adisyon.id)} • {sure} dk önce açıldı
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <a
            href="/mutfak"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm font-medium"
          >
            🍳 Mutfak Ekranı
          </a>
          <Link
            href="/restoran"
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm font-medium"
          >
            ← Masalar
          </Link>
        </div>
      </div>

      {/* İki Kolon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <UrunButonlari adisyonId={adisyon.id} urunler={urunler} />
        </div>
        <div>
          <SiparisListesi adisyon={adisyon} kasaHesaplari={kasaHesaplari} />
        </div>
      </div>
      {/* Sipariş listesinin altına mutfak linki */}
      <div className="pt-3 border-t mt-3">
        <a
          href="/mutfak"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border-2 border-orange-400 text-orange-700 py-3 rounded-lg hover:bg-orange-50 font-medium"
        >
          🍳 Mutfak Ekranını Aç
          <span className="text-xs">(yeni sekme)</span>
        </a>
      </div>
    </div>
  );
}
