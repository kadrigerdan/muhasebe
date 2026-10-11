import { notFound } from 'next/navigation';
import { adisyonGetir } from '@/models/adisyonModel';
import { ayarlariGetir } from '@/models/ayarlarModel';
import FisYazdirButonu from '@/components/restoran/FisYazdirButonu';

export const dynamic = 'force-dynamic';

const GENISLIK = 32;

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

  const [adisyon, ayarlar] = await Promise.all([
    adisyonGetir(id),
    ayarlariGetir(),
  ]);
  if (!adisyon) notFound();

  const tarih = new Date(adisyon.acilis_tarih);
  const saat = tarih.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tarihStr = tarih.toLocaleDateString('tr-TR');

  const satirlar = [];
  satirlar.push(cizgi('='));
  satirlar.push(orta(kisalt(ayarlar.sirket_adi || 'ŞİRKET ADI')));
  if (ayarlar.adres) {
    // Adres uzunsa birden fazla satıra böl
    const kelimeler = ayarlar.adres.split(' ');
    let satir = '';
    for (const kelime of kelimeler) {
      if ((satir + ' ' + kelime).length > GENISLIK) {
        satirlar.push(orta(satir.trim()));
        satir = kelime;
      } else {
        satir = satir ? satir + ' ' + kelime : kelime;
      }
    }
    if (satir.trim()) satirlar.push(orta(satir.trim()));
  }
  if (ayarlar.telefon) {
    satirlar.push(orta(`Tel: ${ayarlar.telefon}`));
  }
  if (ayarlar.vergi_no) {
    satirlar.push(orta(`Vergi No: ${ayarlar.vergi_no}`));
  }
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

  // Fiş alt notu (varsa) veya varsayılan
  const altNot = ayarlar.fis_alt_not || 'Afiyet olsun!';
  const altKelimeler = altNot.split(' ');
  let altSatir = '';
  for (const kelime of altKelimeler) {
    if ((altSatir + ' ' + kelime).length > GENISLIK) {
      satirlar.push(orta(altSatir.trim()));
      altSatir = kelime;
    } else {
      altSatir = altSatir ? altSatir + ' ' + kelime : kelime;
    }
  }
  if (altSatir.trim()) satirlar.push(orta(altSatir.trim()));

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
                font-size: 9px !important;
                letter-spacing: -0.15px !important;
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
