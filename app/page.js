import Link from 'next/link';
import { query } from '@/database/db';
import { kasaTipOzet, kasaOzet } from '@/models/kasaModel';
import { paraFormat, sayiFormat } from '@/lib/format';
import { adisyonOzet } from '@/models/adisyonModel';
import { tumBildirimler } from '@/models/bildirimModel';
import Bildirimler from '@/components/Bildirimler';

export const dynamic = 'force-dynamic';

export default async function AnaSayfa() {
  const [
    cariArr, urunArr, personelArr, stokArr, kritikArr, tukenenArr,
    alisArr, satisArr, kasaTip, kasaGenel, restoranOzet, bildirimData,
  ] = await Promise.all([
    query('SELECT COUNT(*) AS toplam FROM cariler WHERE aktif = 1'),
    query('SELECT COUNT(*) AS toplam FROM urunler WHERE durum = 1'),
    query('SELECT COUNT(*) AS toplam FROM personel WHERE aktif = 1'),
    query('SELECT COALESCE(SUM(stok * varsayilan_alis_fiyati), 0) AS deger FROM urunler WHERE durum = 1'),
    query('SELECT COUNT(*) AS toplam FROM urunler WHERE durum = 1 AND stok > 0 AND stok <= kritik_seviye'),
    query('SELECT COUNT(*) AS toplam FROM urunler WHERE durum = 1 AND stok <= 0'),
    query('SELECT COALESCE(SUM(d.miktar * d.birim_fiyat), 0) AS toplam FROM alis_faturalar f JOIN alis_fatura_detaylari d ON d.fatura_id = f.id'),
    query('SELECT COALESCE(SUM(d.adet * d.birim_fiyat), 0) AS toplam FROM satis_faturalar f JOIN satis_fatura_detaylari d ON d.fatura_id = f.id'),
    kasaTipOzet(),
    kasaOzet(),
    adisyonOzet(),
    tumBildirimler(),
  ]);

  const cariSayi = cariArr[0];
  const urunSayi = urunArr[0];
  const personelSayi = personelArr[0];
  const stokDeger = stokArr[0];
  const kritikSayi = kritikArr[0];
  const tukenenSayi = tukenenArr[0];
  const alisToplam = Number(alisArr[0].toplam);
  const satisToplam = Number(satisArr[0].toplam);
  const kar = satisToplam - alisToplam;
  const restoran = restoranOzet;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Muhasebe Paneli</h1>
      <Bildirimler bildirimler={bildirimData} />
      {/* KASA DURUMU */}
      <div>
        <div className="p-1.5 bg-white">Kasa Durumu</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/kasa" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Nakit (Fiziksel)</div>
            <div className="text-2xl font-bold text-green-700">
              {paraFormat(kasaTip.nakit)} ₺
            </div>
          </Link>
          <Link href="/kasa" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Banka</div>
            <div className="text-2xl font-bold text-blue-700">
              {paraFormat(kasaTip.banka)} ₺
            </div>
          </Link>
          <Link href="/kasa" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">POS</div>
            <div className="text-2xl font-bold text-purple-700">
              {paraFormat(kasaTip.pos)} ₺
            </div>
          </Link>
          <Link href="/kasa" className="border rounded-lg p-4 bg-gray-100 hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Toplam Likidite</div>
            <div className="text-2xl font-bold">
              {paraFormat(kasaGenel.toplam_bakiye)} ₺
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {sayiFormat(kasaGenel.aktif_kasa_sayisi)} aktif kasa
            </div>
          </Link>
        </div>
      </div>



      {/* ANA KARTLAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/cariler" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Aktif Cari</div>
          <div className="text-2xl font-bold">{sayiFormat(cariSayi.toplam)}</div>
        </Link>
        <Link href="/urunler" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Aktif Ürün</div>
          <div className="text-2xl font-bold">{sayiFormat(urunSayi.toplam)}</div>
        </Link>
        <Link href="/personel" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Aktif Personel</div>
          <div className="text-2xl font-bold">{sayiFormat(personelSayi.toplam)}</div>
        </Link>
        <Link href="/stok" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Stok Değeri</div>
          <div className="text-2xl font-bold">
            {paraFormat(stokDeger.deger)} ₺
          </div>
        </Link>
      </div>

      {/* RESTORAN DURUMU */}
      <div>
        <div className=" p-1.5 bg-white ">Restoran Durumu</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/restoran" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Açık Adisyon</div>
            <div className="text-2xl font-bold text-red-700">
              {String(restoran.acik_adisyon)}
            </div>
          </Link>
          <Link href="/mutfak" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Mutfakta Bekleyen</div>
            <div className="text-2xl font-bold text-orange-700">
              {String(restoran.mutfak_bekleyen)}
            </div>
          </Link>
          <Link href="/restoran/rapor" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Bugün Kapanan</div>
            <div className="text-2xl font-bold text-green-700">
              {String(restoran.bugun_kapanan)}
            </div>
          </Link>
          <Link href="/restoran/rapor" className="border rounded-lg p-4 bg-gray-100 hover:shadow-md transition">
            <div className="text-xs text-gray-500 mb-1">Bugün Ciro</div>
            <div className="text-2xl font-bold">
              {paraFormat(restoran.bugun_ciro)} ₺
            </div>
          </Link>
        </div>
      </div>



      {/* UYARILAR + ALIŞ/SATIŞ/KÂR — Tek Sıra */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/stok" className="border rounded-lg p-4 bg-red-50 hover:shadow-md transition">
          <div className="text-xs text-red-600 mb-1">Tükenen Ürün</div>
          <div className="text-2xl font-bold text-red-700">
            {sayiFormat(tukenenSayi.toplam)}
          </div>
        </Link>

        <Link href="/stok" className="border rounded-lg p-4 bg-yellow-50 hover:shadow-md transition">
          <div className="text-xs text-yellow-600 mb-1">Kritik Stok</div>
          <div className="text-2xl font-bold text-yellow-700">
            {sayiFormat(kritikSayi.toplam)}
          </div>
        </Link>

        <Link href="/alis-faturalar" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Toplam Alış</div>
          <div className="text-2xl font-bold text-orange-700">
            {paraFormat(alisToplam)} ₺
          </div>
        </Link>

        <Link href="/satis-faturalar" className="border rounded-lg p-4 bg-white hover:shadow-md transition">
          <div className="text-xs text-gray-500 mb-1">Toplam Satış</div>
          <div className="text-2xl font-bold text-green-700">
            {paraFormat(satisToplam)} ₺
          </div>
        </Link>

        <div className={`border rounded-lg p-4 ${kar >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Brüt Kâr</div>
          <div className={`text-2xl font-bold ${kar >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {paraFormat(kar)} ₺
          </div>
        </div>
      </div>

      {/* HIZLI ERİŞİM */}
      <div className="border rounded-lg p-5 bg-white">
        <h2 className="text-lg font-bold mb-3">Hızlı Erişim</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/cariler/yeni" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Cari
          </Link>
          <Link href="/alis-faturalar/yeni" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            + Alış Faturası
          </Link>
          <Link href="/satis-faturalar/yeni" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Satış Faturası
          </Link>
          <Link href="/personel/yeni" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            + Personel
          </Link>
          <Link href="/kasa/virman" className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
            Virman
          </Link>
          <Link href="/stok" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Stok Durumu
          </Link>
          <Link href="/restoran" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Restoran
          </Link>
        </div>
      </div>
    </div>
  );
}