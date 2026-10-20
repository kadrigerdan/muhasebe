import Link from 'next/link';
import { paraFormat } from '@/lib/format';

export default function Bildirimler({ bildirimler }) {
  const {
    kritikStok,
    odenmemisSatis,
    odenmemisAlis,
    uzunAdisyon,
    mutfakBekleyen,
    vadesiGecen,
  } = bildirimler;

  // Hiçbir uyarı yok mu?
  const toplamUyari =
    kritikStok.length +
    odenmemisSatis.length +
    odenmemisAlis.length +
    uzunAdisyon.length +
    (mutfakBekleyen > 0 ? 1 : 0) +
    vadesiGecen.length;

  if (toplamUyari === 0) {
    return (
      <div className="border-2 border-green-300 rounded-lg bg-green-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-bold text-green-800">Her şey yolunda - Şu an bekleyen bir uyarı yok.</div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        🔔 Uyarılar
        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
          {toplamUyari}
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kritik Stok */}
        {kritikStok.length > 0 && (
          <Link
            href="/stok"
            className="border-l-4 border-red-500 bg-red-50 rounded-lg p-3 hover:bg-red-100 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-red-800">
                ⚠️ Kritik Stok ({kritikStok.length})
              </div>
              <span className="text-xs text-red-600">Stok →</span>
            </div>
            <ul className="text-xs text-red-700 space-y-0.5">
              {kritikStok.slice(0, 3).map((u) => (
                <li key={String(u.id)} className="flex justify-between">
                  <span>{u.urun_adi}</span>
                  <span className="font-mono">
                    {String(u.stok)} / {String(u.kritik_seviye)}
                  </span>
                </li>
              ))}
              {kritikStok.length > 3 && (
                <li className="italic">+{kritikStok.length - 3} ürün daha...</li>
              )}
            </ul>
          </Link>
        )}

        {/* Mutfakta Bekleyen */}
        {mutfakBekleyen > 0 && (
          <Link
            href="/mutfak"
            className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-3 hover:bg-orange-100 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-orange-800">
                  🍳 Mutfakta Bekleyen
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {String(mutfakBekleyen)}
                </div>
              </div>
              <span className="text-xs text-orange-600">Mutfak →</span>
            </div>
          </Link>
        )}

        {/* Uzun Süre Açık Adisyon */}
        {uzunAdisyon.length > 0 && (
          <Link
            href="/restoran"
            className="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-3 hover:bg-yellow-100 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-yellow-800">
                ⏰ Uzun Süre Açık ({uzunAdisyon.length})
              </div>
              <span className="text-xs text-yellow-700">Restoran →</span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-0.5">
              {uzunAdisyon.slice(0, 3).map((a) => (
                <li key={String(a.id)} className="flex justify-between">
                  <span>{a.masa_ad}</span>
                  <span className="font-mono">
                    {String(a.dakika)} dk • {paraFormat(a.toplam)} ₺
                  </span>
                </li>
              ))}
            </ul>
          </Link>
        )}

        {/* Vadesi Geçen */}
        {vadesiGecen.length > 0 && (
          <Link
            href="/alis-faturalar"
            className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-purple-800">
                📅 Vadesi Geçen Alış ({vadesiGecen.length})
              </div>
              <span className="text-xs text-purple-700">Faturalar →</span>
            </div>
            <ul className="text-xs text-purple-700 space-y-0.5">
              {vadesiGecen.slice(0, 3).map((f) => {
                const kalan = Number(f.toplam) - Number(f.odenen_tutar || 0);
                return (
                  <li key={String(f.id)} className="flex justify-between">
                    <span>{f.cari}</span>
                    <span className="font-mono">
                      {String(f.gun)} gün • {paraFormat(kalan)} ₺
                    </span>
                  </li>
                );
              })}
            </ul>
          </Link>
        )}

        {/* Ödenmemiş Satış */}
        {odenmemisSatis.length > 0 && (
          <Link
            href="/satis-faturalar"
            className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-blue-800">
                💰 Tahsil Edilmemiş ({odenmemisSatis.length})
              </div>
              <span className="text-xs text-blue-700">Satış →</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-0.5">
              {odenmemisSatis.slice(0, 3).map((f) => {
                const kalan = Number(f.toplam) - Number(f.odenen_tutar || 0);
                return (
                  <li key={String(f.id)} className="flex justify-between">
                    <span>{f.cari}</span>
                    <span className="font-mono">{paraFormat(kalan)} ₺</span>
                  </li>
                );
              })}
            </ul>
          </Link>
        )}

        {/* Ödenmemiş Alış */}
        {odenmemisAlis.length > 0 && (
          <Link
            href="/alis-faturalar"
            className="border-l-4 border-gray-500 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-gray-800">
                💸 Ödenecek ({odenmemisAlis.length})
              </div>
              <span className="text-xs text-gray-700">Alış →</span>
            </div>
            <ul className="text-xs text-gray-700 space-y-0.5">
              {odenmemisAlis.slice(0, 3).map((f) => {
                const kalan = Number(f.toplam) - Number(f.odenen_tutar || 0);
                return (
                  <li key={String(f.id)} className="flex justify-between">
                    <span>{f.cari}</span>
                    <span className="font-mono">{paraFormat(kalan)} ₺</span>
                  </li>
                );
              })}
            </ul>
          </Link>
        )}
      </div>
    </div>
  );
}
