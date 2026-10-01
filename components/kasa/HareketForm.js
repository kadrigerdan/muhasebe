'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { kasaHareketEkleAction } from '@/actions/kasaActions';

export default function HareketForm({ kasaId }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, pending] = useActionState(kasaHareketEkleAction, null);

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
      className="space-y-3 border rounded p-4 bg-gray-50"
    >
      <h3 className="font-semibold">Manuel Hareket Ekle</h3>

      {state?.error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="kasa_id" value={kasaId} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tip *</label>
          <select name="tip" required className="w-full border rounded px-3 py-2">
            <option value="giris">Giriş (+)</option>
            <option value="cikis">Çıkış (-)</option>
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

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {pending ? 'Kaydediliyor...' : 'Ekle'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Açıklama</label>
        <input
          type="text"
          name="aciklama"
          maxLength={255}
          placeholder="Örn: Ofis kirası ödemesi"
          className="w-full border rounded px-3 py-2"
        />
      </div>
    </form>
  );
}