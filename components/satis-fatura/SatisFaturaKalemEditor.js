'use client';
import { stokTransferAction } from '@/actions/transferActions';
import { paraFormat } from '@/lib/format';
import { useState } from 'react';

export default function SatisFaturaKalemEditor({ urunler, depoId, onChange }) {
  const [kalemler, setKalemler] = useState([]);

  function guncelle(next) {
    setKalemler(next);
    onChange?.(next);
  }

  function kalemEkle() {
    guncelle([...kalemler, { urun_id: '', adet: 1, birim_fiyat: 0 }]);
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
        next[i].birim_fiyat = Number(u.varsayilan_satis_fiyati) || 0;
      }
    }
    guncelle(next);
  }

  const toplam = kalemler.reduce(
    (s, k) => s + Number(k.adet || 0) * Number(k.birim_fiyat || 0),
    0
  );
  const toplamAdet = kalemler.reduce((s, k) => s + Number(k.adet || 0), 0);

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
            <th className="border p-2 w-24">Miktar (Kg)</th>
            <th className="border p-2 w-28">Birim Fiyat</th>
            <th className="border p-2 w-28 text-right">Satır Toplam</th>
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
            const satir = Number(k.adet || 0) * Number(k.birim_fiyat || 0);
            const u = urunler.find((x) => String(x.id) === String(k.urun_id));
            const mevcutStok = u?.stoklar?.[depoId] ?? 0;

            const stokYok = u && mevcutStok <= 0;                                  // 🔴 stok 0
            const adetFazla = u && Number(k.adet) > mevcutStok;                    // 🟠 adet > stok
            const kritikYakin =
              Boolean(u) && u.kritik_seviye != null && mevcutStok > 0 &&
              mevcutStok <= u.kritik_seviye;

            const yetersizStok = Boolean(u) && (stokYok || adetFazla);

            // Stok yeterliliği kontrolü (uyarı)
            return (
              <tr key={i} className={yetersizStok ? 'bg-red-50' : ''}>
                <td className="border p-1">
                  <select
                    value={k.urun_id}
                    onChange={(e) => alanDegis(i, 'urun_id', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">-- Seç --</option>
                    {urunler.map((u) => {
                      const stok = depoId ? (u.stoklar[depoId] ?? 0) : null;
                      const stokText = stok !== null ? ` (stok: ${stok})` : '';
                      return (
                        <option key={u.id} value={u.id}>
                          {u.urun_adi} — Alış: {paraFormat(u.varsayilan_alis_fiyati)} ₺ | Satış: {paraFormat(u.varsayilan_satis_fiyati)} ₺{stokText}
                        </option>
                      );
                    })}
                  </select>
                  {stokYok && (
                    <div className="text-xs text-red-600 font-medium mt-1">
                      🚫 Stokta yok
                    </div>
                  )}
                  {adetFazla && (
                    <div className="text-xs text-amber-600 mt-1">
                      ⚠ Yetersiz stok — mevcut: {mevcutStok}, istenen: {k.adet}
                    </div>
                  )}
                  {!yetersizStok && kritikYakin && (
                    <div className="text-xs text-amber-500 mt-1">
                      ⚠ Kritik seviyede (mevcut: {mevcutStok}, kritik: {u.kritik_seviye})
                    </div>
                  )}
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={k.adet}
                    onChange={(e) => alanDegis(i, 'adet', e.target.value)}
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
                <td className="border p-1 text-right">{paraFormat(satir)} ₺</td>
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
          Toplam Adet: <b>{toplamAdet}</b>
        </div>
        <div>
          Toplam Miktar (Kg): <b>{paraFormat(toplam)} ₺</b>
        </div>
      </div>
    </div>
  );
}