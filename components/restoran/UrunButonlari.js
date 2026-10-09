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
    <div className="space-y-3">
      <h3 className="font-semibold">Ürün Ekle</h3>

      {hata && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {hata}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {urunler.map((u) => (
          <button
            key={String(u.id)}
            onClick={() => urunEkle(u)}
            disabled={pending}
            className={`border-2 rounded-lg p-4 text-left transition active:scale-95 disabled:opacity-50 ${
              eklenenId === u.id
                ? 'bg-green-200 border-green-500'
                : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="font-bold text-sm mb-1">{u.urun_adi}</div>
            <div className="text-lg font-bold text-blue-700">
              {paraFormat(u.varsayilan_satis_fiyati)} ₺
            </div>
          </button>
        ))}

        {urunler.length === 0 && (
          <div className="col-span-full text-gray-500 text-sm p-4">
            Satış ürünü yok. Ürünler sayfasından ekleyin.
          </div>
        )}
      </div>
    </div>
  );
}
