'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { satisFaturaEkleAction } from '@/actions/satisFaturaActions';
import SatisFaturaKalemEditor from './SatisFaturaKalemEditor';

export default function SatisFaturaForm({ cariler, urunler, onSuccess }) {
  const router = useRouter();
  const [kalemler, setKalemler] = useState([]);
  const [state, formAction, pending] = useActionState(satisFaturaEkleAction, null);

  useEffect(() => {
    if (state?.ok) {
      if (onSuccess) onSuccess();
      else router.push('/satis-faturalar');
    }
  }, [state, onSuccess, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
      )}

      <input type="hidden" name="kalemler" value={JSON.stringify(kalemler)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Müşteri *</label>
          <select
            name="cari_id"
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Seç --</option>
            {cariler.map((c) => (
              <option key={c.id} value={c.id}>
                {c.unvan}-{c.telefon}-{c.adres}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Tarih *</label>
          <input
            type="date"
            name="tarih"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <SatisFaturaKalemEditor urunler={urunler} onChange={setKalemler} />

      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
      </button>
    </form>
  );
}