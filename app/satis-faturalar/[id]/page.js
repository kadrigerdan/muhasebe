import { notFound } from 'next/navigation';
import Link from 'next/link';
import { satisFaturaGetir } from '@/models/satisFaturaModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import TahsilatForm from '@/components/satis-fatura/TahsilatForm';
import { paraFormat } from '@/lib/format';
import ArsivleButonu from '@/components/ArsivleButonu';
import GeriAlButonu from '@/components/GeriAlButonu';
import { satisFaturaArsivleAction, satisFaturaGeriAlAction } from '@/actions/satisFaturaActions';
import IadeOdemeForm from '@/components/satis-fatura/IadeOdemeForm';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await satisFaturaGetir(id);
  if (!fatura) notFound();

  const kasaHesaplari = await aktifKasaHesaplari();

  const toplam = Number(fatura.toplam);
  const odenen = Number(fatura.odenen_tutar ?? 0);
  const kalan = toplam - odenen;
  const iade = fatura.fatura_tipi === 'iade';
  const arsivli = Number(fatura.arsivlendi) === 1;

  const durumRenk = {
    odenmedi: 'bg-red-100 text-red-700',
    kismi: 'bg-yellow-100 text-yellow-700',
    odendi: 'bg-green-100 text-green-700',
  };
  const durumEtiket = {
    odenmedi: 'Ödenmedi',
    kismi: 'Kısmi',
    odendi: 'Ödendi',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* İADE BANNER */}
      {iade && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded">
          ↩️ Bu bir <b>iade faturasıdır</b>.
          {fatura.kaynak_fatura_id && (
            <>
              {' '}Kaynak:{' '}
              <Link
                href={`/satis-faturalar/${fatura.kaynak_fatura_id}`}
                className="underline font-medium"
              >
                Fatura #{fatura.kaynak_fatura_id}
              </Link>
            </>
          )}
        </div>
      )}

      {/* ARŞİV BANNER */}
      {arsivli && (
        <div className="bg-slate-100 border border-slate-300 text-slate-700 text-sm p-3 rounded">
          🗄️ Bu fatura arşivlenmiştir.
          {fatura.arsiv_tarihi && (
            <> Tarih: {new Date(fatura.arsiv_tarihi).toLocaleString('tr-TR')}</>
          )}
        </div>
      )}

      {/* BAŞLIK + BUTONLAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">
          Satış Faturası #{String(fatura.id)}
          {iade && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded align-middle">
              İade
            </span>
          )}
          {arsivli && (
            <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded align-middle">
              Arşiv
            </span>
          )}
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          {arsivli ? (
            <GeriAlButonu id={fatura.id} action={satisFaturaGeriAlAction} />
          ) : (
            <ArsivleButonu id={fatura.id} action={satisFaturaArsivleAction} />
          )}

          {!iade && !arsivli && (
            <Link
              href={`/satis-faturalar/${id}/iade`}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm"
            >
              ↩️ İade Kes
            </Link>
          )}

          <Link
            href={`/satis-faturalar/${id}/yazdir`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            🖨️ Yazdır / PDF
          </Link>
          <Link
            href={`/satis-faturalar/${id}/fis`}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            🧾 Fiş (80mm)
          </Link>
          <Link href="/satis-faturalar" className="text-blue-600 hover:underline self-center text-sm">
            ← Faturalar
          </Link>
        </div>
      </div>

      {/* BİLGİ KARTI */}
      <div className="grid grid-cols-2 gap-4 border rounded p-4">
        <div><b>Müşteri:</b> {fatura.cari_unvan}</div>
        <div><b>Tarih:</b> {new Date(fatura.tarih).toLocaleDateString('tr-TR')}</div>

        <div>
          <b>Toplam:</b>{' '}
          <span className={iade ? 'text-red-700 font-bold' : ''}>
            {iade ? '-' : ''}{paraFormat(toplam)} ₺
          </span>
        </div>

        <div>
          <b>Ödenen:</b>{' '}
          <span className={odenen > 0.01 ? 'text-green-700 font-bold' : 'text-gray-500'}>
            {odenen > 0.01 ? paraFormat(odenen) + ' ₺' : '—'}
          </span>
        </div>

        <div>
          <b>Kalan:</b>{' '}
          {iade ? (
            kalan > 0.01 ? (
              <span className="text-blue-700 font-bold">
                {paraFormat(kalan)} ₺ alacak
              </span>
            ) : (
              <span className="text-green-700 font-bold">✓ Ödendi</span>
            )
          ) : (
            <span className={kalan > 0.01 ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
              {kalan > 0.01 ? paraFormat(kalan) + ' ₺' : '✓ Ödendi'}
            </span>
          )}
        </div>

        <div>
          <b>Durum:</b>{' '}
          {iade ? (
            kalan > 0.01 ? (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                İade (Alacak)
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                İade ✓ Ödendi
              </span>
            )
          ) : (
            <span className={`text-xs px-2 py-0.5 rounded ${durumRenk[fatura.durum] || 'bg-gray-100'}`}>
              {durumEtiket[fatura.durum] || fatura.durum}
            </span>
          )}
        </div>
      </div>

      {/* TAHSİLAT / İADE ÖDEME FORMU */}
      {!iade && !arsivli && (
        <TahsilatForm faturaId={id} kalan={kalan} kasaHesaplari={kasaHesaplari} />
      )}
      {iade && !arsivli && (
        <IadeOdemeForm faturaId={id} kalan={kalan} kasaHesaplari={kasaHesaplari} />
      )}

      {/* KALEMLER */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ürün</th>
            <th className="border p-2 text-right">Adet</th>
            <th className="border p-2 text-right">Birim Fiyat</th>
            <th className="border p-2 text-right">Satır Toplam</th>
          </tr>
        </thead>
        <tbody>
          {fatura.kalemler.map((k) => {
            const satir = Number(k.adet) * Number(k.birim_fiyat);
            return (
              <tr key={String(k.id)}>
                <td className="border p-2">{k.urun_adi}</td>
                <td className="border p-2 text-right">{String(k.adet)}</td>
                <td className="border p-2 text-right">{paraFormat(k.birim_fiyat)} ₺</td>
                <td className="border p-2 text-right">{paraFormat(satir)} ₺</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}