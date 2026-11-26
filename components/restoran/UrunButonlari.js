'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adisyonKalemEkleAction } from '@/actions/adisyonActions';
import { paraFormat } from '@/lib/format';

export default function UrunButonlari({ adisyonId, urunler }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState(null);
  const [eklenenId, setEklenenId] = useState(null);

  function urunEkle(urun) {
    const mevcutStok = Number(urun.urun_stok ?? urun.urun_stok.stok ?? 0);
    if (mevcutStok <= 0) {
      setHata(`${urun.urun_adi} Restoran Deposu'nda stokta yok.`);
      return;
    }

    setHata(null);
    setEklenenId(urun.id);
    startTransition(async () => {
      const res = await adisyonKalemEkleAction(adisyonId, urun.id, 1);
      if (res?.error) {
        setHata(res.error);
      } else {
        router.refresh();
        setTimeout(() => setEklenenId(null), 500);
      }
    });
  }


  return (
    <div className="w-full min-w-0 space-y-2">
      <h3 className="font-semibold">Ürün Ekle</h3>

      {hata && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {hata}
        </div>
      )}

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 min-[750px]:grid-cols-4 lg:grid-cols-5 gap-2">
        {urunler.map((u) => {
          const stok = Number(
            typeof u.urun_stok === 'object' && u.urun_stok !== null
              ? u.urun_stok.stok
              : (u.urun_stok ?? u.restoran_stok ?? u.stok ?? 0)
          );

          const stoktaYok = stok <= 0;

          return (
            <button
              key={String(u.id)}
              type="button"
              onClick={() => urunEkle(u)}
              disabled={pending || stoktaYok}
              className={`border-2 rounded-lg p-4 text-left transition active:scale-95 disabled:opacity-50 ${stoktaYok
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                : eklenenId === u.id
                  ? 'bg-green-200 border-green-500'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
            >
              <div className="font-bold text-sm mb-1">{u.urun_adi}</div>
              <div className="text-lg font-bold text-blue-700">
                {paraFormat(u.varsayilan_satis_fiyati)} ₺
              </div>
              <div
                className={`mt-1.5 text-xs font-semibold ${stoktaYok ? 'text-red-600' : 'text-green-700'
                  }`}
              >
                {stoktaYok ? '✕ Stokta yok' : `✓ Stok: ${stok}`}
              </div>
            </button>
          );
        })}

        {urunler.length === 0 && (
          <div className="col-span-full text-gray-500 text-sm p-4">
            Satış ürünü yok. Ürünler sayfasından ekleyin.
          </div>
        )}
      </div>
    </div>
  );
}