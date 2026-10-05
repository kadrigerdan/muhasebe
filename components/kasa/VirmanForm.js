'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { virmanAction } from '@/actions/kasaActions';
import { paraFormat } from '@/lib/format';

export default function VirmanForm({ kasaHesaplari }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, pending] = useActionState(virmanAction, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 border rounded p-4 bg-white"
    >
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kaynak Kasa *</label>
          <select name="kaynak_id" required className="w-full border rounded px-3 py-2">
            <option value="">-- Seç --</option>
            {kasaHesaplari.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad} — bakiye: {paraFormat(k.bakiye)} ₺
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hedef Kasa *</label>
          <select name="hedef_id" required className="w-full border rounded px-3 py-2">
            <option value="">-- Seç --</option>
            {kasaHesaplari.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad} — bakiye: {paraFormat(k.bakiye)} ₺
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tutar *</label>
          <input
            type="number"
            name="tutar"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full border rounded px-3 py-2"
          />
        </div>

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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Açıklama</label>
        <input
          type="text"
          name="aciklama"
          maxLength={255}
          placeholder="Örn: Bankadan nakit çekme"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {pending ? 'Transfer ediliyor...' : 'Virman Yap'}
      </button>
    </form>
  );
}