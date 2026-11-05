import { notFound } from 'next/navigation';
import Link from 'next/link';
import { alisFaturaGetir } from '@/models/alisFaturaModel';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import OdemeForm from '@/components/alis-fatura/OdemeForm';
import IadeOdemeForm from '@/components/alis-fatura/IadeOdemeForm';
import { paraFormat } from '@/lib/format';
import ArsivleButonu from '@/components/ArsivleButonu';
import GeriAlButonu from '@/components/GeriAlButonu';
import {
  alisFaturaArsivleAction, alisFaturaGeriAlAction,
} from '@/actions/alisFaturaActions';
import { alisFaturaMahsupAction } from '@/actions/alisFaturaActions';

export const dynamic = 'force-dynamic';

export default async function AlisFaturaDetayPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const fatura = await alisFaturaGetir(id);
  if (!fatura) notFound();

  const kasaHesaplari = await aktifKasaHesaplari();

  const toplam = Number(fatura.toplam);
  const odenen = Number(fatura.odenen_tutar ?? 0);
  const iadeToplam = Number(fatura.iade_toplam ?? 0);
  const kalan = Math.max(0, toplam - odenen - iadeToplam);
  const iade = fatura.fatura_tipi === 'iade';
  const arsivli = Number(fatura.arsivlendi) === 1;

  const durumRenk = {
    odenmedi: 'bg-red-100 text-red-700',
    kismi: 'bg-yellow-100 text-yellow-700',
    odendi: 'bg-green-100 text-green-700',
  };
  const durumEtiket = {
    odenmedi: 'Ödenmedi',
    kismi: 'Kısmi Ödendi',
    odendi: 'Ödendi',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* İADE BANNER */}
      {iade && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded">
          ↩️ Bu bir <b>iade faturasıdır</b>.
          {fatura.kaynak_fatura_id && (
            <>
              {' '}Kaynak:{' '}
              <Link
                href={`/alis-faturalar/${fatura.kaynak_fatura_id}`}
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
          Alış Faturası #{String(fatura.id)}
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
            <GeriAlButonu id={fatura.id} action={alisFaturaGeriAlAction} />
          ) : (
            <ArsivleButonu id={fatura.id} action={alisFaturaArsivleAction} />
          )}

          {!iade && !arsivli && (
            <Link
              href={`/alis-faturalar/${id}/iade`}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm"
            >
              ↩️ İade Kes
            </Link>
          )}

          {fatura.iade_kullanilabilir > 0.01 && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
              💰 Bu cariye ait <b>{paraFormat(fatura.iade_kullanilabilir)} ₺</b> iade alacağı var.
              <button>Bu faturaya mahsup et</button>
            </div>
          )}

          <Link
            href={`/alis-faturalar/${id}/yazdir`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            🖨️ Yazdır / PDF
          </Link>
          <Link
            href={`/alis-faturalar/${id}/fis`}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            🧾 Fiş (80mm)
          </Link>
          <Link href="/alis-faturalar" className="text-blue-600 hover:underline self-center text-sm">
            ← Faturalar
          </Link>
        </div>
      </div>

      {/* BİLGİ KARTI */}
      <div className="grid grid-cols-2 gap-4 border rounded p-4">
        <div><b>Tedarikçi:</b> {fatura.cari_unvan}</div>
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
            ) : iadeToplam > 0.01 && kalan > 0.01 ? (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                Kısmi İade
              </span>
            ) : iadeToplam > 0.01 && kalan <= 0.01 ? (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                İade ile Kapandı
              </span>
            ) : (
              <span className={`text-xs px-2 py-0.5 rounded ${durumRenk[fatura.durum] || 'bg-gray-100'}`}>
                {durumEtiket[fatura.durum] || fatura.durum}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ÖDEME FORMU — normal fatura */}
      {!iade && !arsivli && (
        <OdemeForm faturaId={id} kalan={kalan} kasaHesaplari={kasaHesaplari} />
      )}

      {!iade && !arsivli && fatura.iade_kullanilabilir > 0.01 && kalan > 0.01 && (
        <form action={alisFaturaMahsupAction} className="border rounded p-4 bg-blue-50 space-y-3">
          <h3 className="font-semibold text-blue-900">💰 İade Alacağından Mahsup</h3>
          <div className="text-xs text-blue-800">
            Bu cariye ait <b>{paraFormat(fatura.iade_kullanilabilir)} ₺</b> iade alacağı var.
          </div>
          <input type="hidden" name="fatura_id" value={id} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Mahsup Tutarı</label>
              <input
                type="number"
                name="tutar"
                step="0.01"
                min="0.01"
                max={Math.min(fatura.iade_kullanilabilir, kalan)}
                defaultValue={Math.min(fatura.iade_kullanilabilir, kalan).toFixed(2)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarih</label>
              <input
                type="date"
                name="tarih"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Mahsup Et
              </button>
            </div>
          </div>
        </form>
      )}

      {/* İADE MAHSUP FORMU — iade faturası */}
      {iade && !arsivli && kalan > 0.01 && (
        <IadeOdemeForm faturaId={id} kalan={kalan} />
      )}
      {/* KALEMLER */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ürün</th>
            <th className="border p-2 text-right">Miktar</th>
            <th className="border p-2 text-right">Birim Fiyat</th>
            <th className="border p-2 text-right">Satır Toplam</th>
          </tr>
        </thead>
        <tbody>
          {fatura.kalemler.map((k) => {
            const satir = Number(k.miktar) * Number(k.birim_fiyat);
            return (
              <tr key={String(k.id)}>
                <td className="border p-2">{k.urun_adi}</td>
                <td className="border p-2 text-right">{String(k.miktar)}</td>
                <td className="border p-2 text-right">
                  {paraFormat(k.birim_fiyat)} ₺
                </td>
                <td className="border p-2 text-right">{paraFormat(satir)} ₺</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}