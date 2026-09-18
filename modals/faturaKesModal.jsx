"use client";

export function FaturaKesModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  musteri,
  tarih,
  urunListesi,
  urunler,
}) {
  if (!isOpen) return null;

  // Toplam Tutar Hesaplama
  const toplam = urunListesi.reduce(
    (acc, u) => acc + Number(u.adet || 0) * Number(u.birimFiyat || 0),
    0
  );

  const urunAdiBul = (urunId) =>
    urunler?.find((u) => u.id === Number(urunId))?.urun_adi || "—";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Fatura Özeti
        </h2>

        {/* Müşteri ve Tarih */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Müşteri:</span>
            <p className="font-semibold">{musteri || "—"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tarih:</span>
            <p className="font-semibold">{tarih}</p>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="p-2 border">Ürün</th>
                <th className="p-2 border text-right">Adet</th>
                <th className="p-2 border text-right">Birim Fiyat</th>
                <th className="p-2 border text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {urunListesi.map((u) => {
                const adet = Number(u.adet || 0);
                const fiyat = Number(u.birimFiyat || 0);
                const tutar = adet * fiyat;
                return (
                  <tr key={u.id} className="border-b">
                    <td className="p-2 border">{urunAdiBul(u.urun_id)}</td>
                    <td className="p-2 border text-right">{adet}</td>
                    <td className="p-2 border text-right">
                      {fiyat.toFixed(2)} ₺
                    </td>
                    <td className="p-2 border text-right font-medium">
                      {tutar.toFixed(2)} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Genel Toplam Kutusu */}
        <div className="flex justify-end">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-6 py-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Genel Toplam:
            </span>
            <span className="ml-3 text-2xl font-bold text-green-700 dark:text-green-400">
              {toplam.toFixed(2)} ₺
            </span>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {isPending ? "Kaydediliyor..." : "Onayla ve Kes"}
          </button>
        </div>
      </div>
    </div>
  );
}