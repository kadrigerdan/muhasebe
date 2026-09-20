"use client";
import { useState, useEffect, useActionState } from "react";
import { createPortal } from "react-dom";
import { urunEkleActions } from "@/actions/urunEkleActions";

export function UrunEkleModal({ isOpen, onClose, yeniUrunEklendi }) {
  const [mounted, setMounted] = useState(false);
  const initialState = { success: false, error: null };
  const [state, formAction, isPending] = useActionState(urunEkleActions, initialState);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.success && state?.data) {
      if (yeniUrunEklendi) yeniUrunEklendi(state.data);
      onClose?.();
    }
  }, [state?.success, state?.data?.id]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Hızlı Ürün Ekle
        </h2>

        {state?.message && !state?.success && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Ürün Adı *</label>
            <input
              type="text"
              name="urun_adi"
              required
              placeholder="Örn: 12kg Mutfak Tüp"
              className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Alış Fiyatı (₺)</label>
              <input
                type="number"
                step="1.00"
                name="varsayilan_alis_fiyati"
                placeholder="0.00"
                className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Satış Fiyatı (₺)</label>
              <input
                type="number"
                step="1.00"
                name="varsayilan_satis_fiyati"
                placeholder="0.00"
                className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition whitespace-nowrap"
            >
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}