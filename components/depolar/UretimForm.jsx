'use client';
import { useActionState, useEffect, useState } from 'react';
import { uretimAction } from '@/actions/uretimActions';

export default function UretimForm({ depolar, urunler }) {
  const [state, formAction, pending] = useActionState(uretimAction, null);
  const [mamuller, setMamuller] = useState([{ mamul_id: '', miktar: 1 }]);

  useEffect(() => {
    if (state?.ok) {
      alert('Üretim kaydedildi!');
      window.location.reload();
    }
  }, [state]);

  const mamulEkle = () => setMamuller([...mamuller, { mamul_id: '', miktar: 1 }]);
  const mamulSil = (index) => setMamuller(mamuller.filter((_, i) => i !== index));
  const alanDegis = (index, alan, deger) => {
    const yeni = [...mamuller];
    yeni[index][alan] = deger;
    setMamuller(yeni);
  };

  return (
    <form action={formAction} className="space-y-4 border rounded-lg p-4 bg-white">
      {state?.error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{state.error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Depo *</label>
          <select name="depo_id" required defaultValue={depolar.find(d => d.ad.includes('Kasap'))?.id || depolar[0]?.id} className="w-full border rounded px-3 py-2">
            {depolar.map((d) => (<option key={d.id} value={d.id}>{d.ad}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Açıklama</label>
          <input type="text" name="aciklama" className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <label className="block font-medium mb-1">Hammadde (Karkas vb.) *</label>
          <select name="hammadde_id" required className="w-full border rounded px-3 py-2">
            <option value="">-- Seç --</option>
            {urunler.map((u) => (<option key={u.id} value={u.id}>{u.urun_adi}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Hammadde Miktarı (Kg) *</label>
          <input type="number" name="hammadde_miktar" step="0.01" min="0.01" required className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Üretilen Mamuller</h3>
          <button type="button" onClick={mamulEkle} className="text-blue-600 text-sm hover:underline">+ Mamul Ekle</button>
        </div>
        {mamuller.map((m, i) => (
          <div key={i} className="flex gap-2 mb-2 items-end">
            <div className="flex-1">
              <select value={m.mamul_id} onChange={(e) => alanDegis(i, 'mamul_id', e.target.value)} className="w-full border rounded px-2 py-1" required>
                <option value="">-- Mamul Seç --</option>
                {urunler.map((u) => (<option key={u.id} value={u.id}>{u.urun_adi}</option>))}
              </select>
            </div>
            <div className="w-32">
              <input type="number" value={m.miktar} onChange={(e) => alanDegis(i, 'miktar', e.target.value)} step="0.01" min="0.01" className="w-full border rounded px-2 py-1" required placeholder="Kg" />
            </div>
            {mamuller.length > 1 && (
              <button type="button" onClick={() => mamulSil(i)} className="text-red-500 px-2">✕</button>
            )}
          </div>
        ))}
      </div>

      <input type="hidden" name="mamuller" value={JSON.stringify(mamuller.filter(m => m.mamul_id))} />

      <button type="submit" disabled={pending} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {pending ? 'Kaydediliyor...' : 'Üretimi Kaydet'}
      </button>
    </form>
  );
}