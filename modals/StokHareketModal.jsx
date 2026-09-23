"use client";
import { useEffect, useState, useActionState } from "react";
import { createPortal } from "react-dom";
import { stokHareketEkleAction, getStokHareketleriAction, } from "@/actions/stokActions";

export function StokHareketModal({ urun, isOpen, onClose, kaydedildi }) {
  const [mounted, setMounted] = useState(false);
  const [hareketler, setHareketler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [state, formAction, isPending] = useActionState(stokHareketEkleAction, {
    success: false,
  });

  const bugun = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen || !urun) return;
    (async () => {
      setYukleniyor(true);
      const res = await getStokHareketleriAction(urun.id);
      if (res.success) setHareketler(res.data);
      setYukleniyor(false);
    })();
  }, [isOpen, urun]);

  useEffect(() => {
    if (state?.success) {
      kaydedildi?.();
      onClose?.();
    }
  }, [state, kaydedildi, onClose]);

  if (!mounted || !isOpen || !urun) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {urun.urun_adi}
            </h2>
            <p className="text-sm text-gray-500">
              Mevcut stok: <b>{urun.stok}</b> · Kritik seviye:{" "}
              {urun.kritik_seviye ?? 0}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {state?.message && !state?.success && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            {state.message}
          </div>
        )}

        <form
          action={formAction}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end border-b pb-4"
        >
          <input type="hidden" name="urun_id" value={urun.id} />

          <div>
            <label className="block text-xs mb-1">Tip</label>
            <select
              name="tip"
              className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="giris">Giriş</option>
              <option value="cikis">Çıkış</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1">Miktar</label>
            <input
              type="number"
              name="miktar"
              min="1"
              required
              className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Tarih</label>
            <input
              type="date"
              name="tarih"
              defaultValue={bugun}
              required
              className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "..." : "Ekle"}
          </button>

          <div className="col-span-2 sm:col-span-4">
            <label className="block text-xs mb-1">Açıklama (opsiyonel)</label>
            <input
              name="aciklama"
              placeholder="Örn: Sayım farkı, iade, fire..."
              className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </form>

        <div>
          <h3 className="font-semibold mb-2 text-sm">Hareket Geçmişi</h3>
          {yukleniyor ? (
            <p className="text-sm text-gray-500">Yükleniyor...</p>
          ) : (
            <table className="w-full border text-xs">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-1 border">Tarih</th>
                  <th className="px-2 py-1 border">Tip</th>
                  <th className="px-2 py-1 border text-right">Miktar</th>
                  <th className="px-2 py-1 border">Kaynak</th>
                  <th className="px-2 py-1 border">Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {hareketler.map((h) => (
                  <tr key={h.id}>
                    <td className="px-2 py-1 border">
                      {new Date(h.tarih).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-2 py-1 border">
                      <span
                        className={
                          h.tip === "giris" ? "text-green-600" : "text-red-600"
                        }
                      >
                        {h.tip === "giris" ? "Giriş" : "Çıkış"}
                      </span>
                    </td>
                    <td className="px-2 py-1 border text-right">{h.miktar}</td>
                    <td className="px-2 py-1 border">{h.kaynak}</td>
                    <td className="px-2 py-1 border">{h.aciklama || "-"}</td>
                  </tr>
                ))}
                {hareketler.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      Henüz hareket yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}