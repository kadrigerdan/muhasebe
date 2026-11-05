'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { satisIadeOdemeAction } from '@/actions/satisFaturaActions';
import { paraFormat } from '@/lib/format';

export default function IadeOdemeForm({ faturaId, kalan, kasaHesaplari, musteriBorc }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, pending] = useActionState(satisIadeOdemeAction, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  if (kalan <= 0.01) {
    return (
      <div className="border rounded p-4 bg-green-50 text-green-700 text-sm">
        ✓ Bu iade faturasındaki alacak tamamen ödendi.
      </div>
    );
  }

  const borclu = Number(musteriBorc) > 0.01;

  const varsayilanKasa =
    kasaHesaplari.find((k) => k.ad.toLowerCase().includes('nakit'))?.id ??
    kasaHesaplari[0]?.id ??
    '';

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 border rounded p-4 bg-amber-50"
    >
      <h3 className="font-semibold text-amber-900">
        {borclu ? '📋 Müşteri Borcundan Mahsup' : '💸 Müşteriye Para İadesi'}
      </h3>

      {state?.error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="fatura_id" value={faturaId} />

      {/* Tip seçimi — borç durumuna göre otomatik */}
      {borclu ? (
        <>
          <input type="hidden" name="tip" value="mahsup" />
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            ⚠️ Müşterinin <b>{paraFormat(musteriBorc)} ₺</b> borcu var.
            İade bu borçtan <b>mahsup</b> edilecek. Kasa etkilenmez.
          </div>
        </>
      ) : (
        <>
          <input type="hidden" name="tip" value="para" />
          <div className="bg-green-50 p-3 rounded text-sm text-green-800">
            ✓ Müşterinin borcu yok. Para iadesi yapılabilir.
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tutar *</label>
          <input
            type="number"
            name="tutar"
            step="0.01"
            min="0.01"
            max={kalan}
            required
            defaultValue={kalan.toFixed(2)}
            className="w-full border rounded px-3 py-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            Kalan Alacak: {paraFormat(kalan)} ₺
          </div>
        </div>

        {!borclu && (
          <div>
            <label className="block text-sm font-medium mb-1">Kasa *</label>
            <select
              name="kasa_id"
              required
              defaultValue={varsayilanKasa}
              className="w-full border rounded px-3 py-2"
            >
              {kasaHesaplari.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} — bakiye: {paraFormat(k.bakiye)} ₺
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
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
            disabled={pending}
            className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {pending
              ? 'Kaydediliyor...'
              : borclu
                ? 'Mahsup Et'
                : 'Para İadesi Yap'}
          </button>
        </div>
      </div>
    </form>
  );
}