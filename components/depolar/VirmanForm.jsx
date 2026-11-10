'use client';
import { useActionState, useEffect, useState } from 'react';
import { stokTransferAction } from '@/actions/transferActions';

export default function VirmanForm({ depolar, urunler }) {
  const [state, formAction, pending] = useActionState(stokTransferAction, null);
  const [gonderenDepo, setGonderenDepo] = useState('');

  useEffect(() => {
    if (state?.ok) {
      alert('Transfer başarılı!');
      window.location.reload();
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 border rounded-lg p-4 bg-white">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Gönderen Depo *</label>
          <select
            name="gonderen_depo_id"
            required
            value={gonderenDepo}
            onChange={(e) => setGonderenDepo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Seç --</option>
            {depolar.map((d) => (
              <option key={d.id} value={d.id}>{d.ad}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Alan Depo *</label>
          <select name="alan_depo_id" required className="w-full border rounded px-3 py-2">
            <option value="">-- Seç --</option>
            {depolar.map((d) => (
              <option key={d.id} value={d.id}>{d.ad}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Ürün *</label>
          <select name="urun_id" required className="w-full border rounded px-3 py-2">
            <option value="">-- Seç --</option>
            {urunler.map((u) => {
              const stok = gonderenDepo ? (u.stoklar[gonderenDepo] ?? 0) : null;
              const stokText = stok !== null ? ` (stok: ${stok.toLocaleString('tr-TR')})` : '';
              return (
                <option key={u.id} value={u.id}>
                  {u.urun_adi}{stokText}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Miktar (Kg) *</label>
          <input
            type="number"
            name="miktar"
            step="0.01"
            min="0.01"
            required
            className="w-full border rounded px-3 py-2"
          />
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

        <div>
          <label className="block font-medium mb-1">Açıklama</label>
          <input
            type="text"
            name="aciklama"
            placeholder="Opsiyonel"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Transfer Ediliyor...' : 'Transfer Et'}
      </button>
    </form>
  );
}