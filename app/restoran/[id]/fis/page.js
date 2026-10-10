import { notFound } from 'next/navigation';
import { adisyonGetir } from '@/models/adisyonModel';
import FisYazdirButonu from '@/components/restoran/FisYazdirButonu';

export const dynamic = 'force-dynamic';

const GENISLIK = 30;

function kisalt(str, max = GENISLIK) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function orta(str, genislik = GENISLIK) {
  if (!str) return '';
  const bosluk = Math.max(0, genislik - str.length);
  const sol = Math.floor(bosluk / 2);
  return ' '.repeat(sol) + str;
}

function noktali(sol, sag, genislik = GENISLIK) {
  sol = String(sol);
  sag = String(sag);
  const bosluk = genislik - sol.length - sag.length;
  if (bosluk < 1) return (sol + ' ' + sag).slice(0, genislik);
  return sol + ' '.repeat(bosluk) + sag;
}

function cizgi(karakter = '-') {
  return karakter.repeat(GENISLIK);
}

export default async function FisPage({ params }) {
  const p = await params;
  const id = Number(p.id);
  if (!id || Number.isNaN(id)) notFound();

  const adisyon = await adisyonGetir(id);
  if (!adisyon) notFound();

  const tarih = new Date(adisyon.acilis_tarih);
  const saat = tarih.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tarihStr = tarih.toLocaleDateString('tr-TR');

  const satirlar = [];
  satirlar.push(cizgi('='));
  satirlar.push(orta('ŞİRKET ADI'));
  satirlar.push(orta('Adres satırı'));
  satirlar.push(orta('Tel: 000 000 00 00'));
  satirlar.push(cizgi('='));
  satirlar.push(noktali(adisyon.masa_ad, `${tarihStr} ${saat}`));
  satirlar.push(`Adisyon #${adisyon.id}`);
  satirlar.push(cizgi('-'));

  for (const k of adisyon.kalemler) {
    satirlar.push(kisalt(k.urun_adi));
    satirlar.push(
      noktali(
        `  ${String(k.adet)} x ${Number(k.birim_fiyat).toFixed(2)}`,
        `${Number(k.toplam).toFixed(2)}`
      )
    );
  }

  satirlar.push(cizgi('-'));
  satirlar.push(noktali('TOPLAM', `${Number(adisyon.toplam).toFixed(2)} TL`));
  satirlar.push(cizgi('='));
  satirlar.push('');
  satirlar.push(orta('Afiyet olsun!'));
  satirlar.push(orta('Bizi tercih ettiğiniz için'));
  satirlar.push(orta('teşekkürler.'));
  satirlar.push('');
  satirlar.push(cizgi('='));

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fis-kagidi {
              font-family: 'Courier New', 'Consolas', monospace;
              font-size: 11px;
              line-height: 1.3;
              overflow: hidden;
            }
            .fis-kagidi > div {
              white-space: pre;
              overflow: hidden;
            }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                width: 80mm;
                margin: 0;
                padding: 0;
                background: white !important;
              }
              .fis-kagidi {
                width: 74mm !important;
                max-width: 74mm !important;
                padding: 1mm 2mm !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                font-size: 9.5px !important;
                letter-spacing: -0.1px !important;
                overflow: hidden !important;
              }
              .print-hide { display: none !important; }
            }
          `,
        }}
      />

      <div className="bg-gray-100 min-h-screen">
        <div className="print-hide p-4 bg-white border-b flex justify-between items-center">
          <a
            href={`/restoran/${id}`}
            className="text-blue-600 hover:underline"
          >
            ← Masaya Dön
          </a>
          <FisYazdirButonu />
        </div>

        <div className="p-4 flex justify-center">
          <div className="fis-kagidi bg-white shadow-lg border rounded w-80 p-4">
            {satirlar.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </div>

        <div className="print-hide max-w-md mx-auto p-4 text-center text-xs text-gray-500">
          <p>
            💡 Bu fiş <b>80mm termal yazıcı</b> için hazırlandı.
          </p>
          <p className="mt-1">
            Yazdırırken <b>80mm termal yazıcıyı</b> hedef olarak seçin.
          </p>
        </div>
      </div>
    </>
  );
}
