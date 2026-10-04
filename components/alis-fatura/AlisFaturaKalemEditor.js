'use client';

import { useState } from 'react';

export default function AlisFaturaKalemEditor({ urunler, onChange }) {
  const [kalemler, setKalemler] = useState([]);

  function guncelle(next) {
    setKalemler(next);
    onChange?.(next);
  }

  function kalemEkle() {
    guncelle([...kalemler, { urun_id: '', miktar: 1, birim_fiyat: 0 }]);
  }

  function kalemSil(i) {
    guncelle(kalemler.filter((_, idx) => idx !== i));
  }

  function alanDegis(i, alan, deger) {
    const next = [...kalemler];
    next[i] = { ...next[i], [alan]: deger };

    if (alan === 'urun_id' && deger) {
      const u = urunler.find((x) => String(x.id) === String(deger));
      if (u && (!next[i].birim_fiyat || Number(next[i].birim_fiyat) === 0)) {
        next[i].birim_fiyat = Number(u.varsayilan_alis_fiyati) || 0;
      }
    }
    guncelle(next);
  }

  const toplam = kalemler.reduce(
    (s, k) => s + Number(k.miktar || 0) * Number(k.birim_fiyat || 0),
    0
  );
  const toplamMiktar = kalemler.reduce((s, k) => s + Number(k.miktar || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Kalemler</h3>
        <button
          type="button"
          onClick={kalemEkle}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
        >
          + Kalem Ekle
        </button>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Ürün</th>
            <th className="border p-2 w-24">Miktar</th>
            <th className="border p-2 w-28">Birim Fiyat</th>
            <th className="border p-2 w-28 text-right">Satır</th>
            <th className="border p-2 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {kalemler.length === 0 && (
            <tr>
              <td colSpan={5} className="border p-3 text-center text-gray-500">
                Kalem yok. "Kalem Ekle" ile başla.
              </td>
            </tr>
          )}
          {kalemler.map((k, i) => {
            const satir = Number(k.miktar || 0) * Number(k.birim_fiyat || 0);
            return (
              <tr key={i}>
                <td className="border p-1">
                  <select
                    value={k.urun_id}
                    onChange={(e) => alanDegis(i, 'urun_id', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    {urunler.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.urun_adi} — Alış: {Number(u.varsayilan_alis_fiyati).toFixed(2)} ₺ | Satış: {Number(u.varsayilan_satis_fiyati).toFixed(2)} ₺ (stok: {u.stok})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={k.miktar}
                    onChange={(e) => alanDegis(i, 'miktar', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={k.birim_fiyat}
                    onChange={(e) => alanDegis(i, 'birim_fiyat', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-1 text-right">{satir.toFixed(2)} ₺</td>
                <td className="border p-1 text-center">
                  <button
                    type="button"
                    onClick={() => kalemSil(i)}
                    className="text-red-600"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end gap-6 text-sm">
        <div>
          Toplam Miktar: <b>{toplamMiktar}</b>
        </div>
        <div>
          Toplam Tutar: <b>{toplam.toFixed(2)} ₺</b>
        </div>
      </div>
    </div>
  );
}