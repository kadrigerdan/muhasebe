'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutfakDurumAction, mutfakIptalAction } from '@/actions/adisyonActions';

export default function MutfakKalemKart({ kalem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [iptalPending, startIptal] = useTransition();
  const [hata, setHata] = useState(null);

  function durumGuncelle(yeniDurum) {
    setHata(null);
    startTransition(async () => {
      const res = await mutfakDurumAction(kalem.id, yeniDurum);
      if (res?.error) setHata(res.error);
      else router.refresh();
    });
  }

  function iptalEt() {
    if (!confirm(`"${kalem.urun_adi} × ${kalem.adet}" iptal edilsin mi?\n\nBu ürün FİRE olarak kaydedilecek.`)) return;
    setHata(null);
    startIptal(async () => {
      const res = await mutfakIptalAction(kalem.id);
      if (res?.error) setHata(res.error);
      else router.refresh();
    });
  }

  const acilis = new Date(kalem.created_at);
  const sure = Math.floor((Date.now() - acilis.getTime()) / 60000);

  const renk =
    kalem.mutfak_durum === 'bekliyor'
      ? 'border-orange-400 bg-orange-50'
      : 'border-green-400 bg-green-50';

  return (
    <div className={`border-2 rounded-lg p-4 ${renk}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">
          {kalem.masa_ad}
          {kalem.masa_tip === 'paket' && ' 🥡'}
          {kalem.masa_tip === 'gelal' && ' 🛍️'}
          {kalem.masa_tip === 'masa' && ' 🍽️'}
        </div>
        <div className="text-xs text-gray-600">{sure} dk</div>
      </div>

      <div className="my-3">
        <div className="text-xl font-bold">{kalem.urun_adi}</div>
        <div className="text-2xl font-bold text-blue-700">
          × {String(kalem.adet)}
        </div>
      </div>

      {hata && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-xs mb-2">
          {hata}
        </div>
      )}

      <div className="flex gap-2">
        {kalem.mutfak_durum === 'bekliyor' && (
          <>
            <button
              onClick={() => durumGuncelle('hazir')}
              disabled={pending || iptalPending}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {pending ? '...' : '✓ Hazır'}
            </button>
            <button
              onClick={iptalEt}
              disabled={pending || iptalPending}
              className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 disabled:opacity-50 font-medium"
              title="İptal et (fire olarak kaydedilir)"
            >
              {iptalPending ? '...' : '🗑️'}
            </button>
          </>
        )}

        {kalem.mutfak_durum === 'hazir' && (
          <button
            onClick={() => durumGuncelle('servis')}
            disabled={pending || iptalPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {pending ? '...' : '🍽️ Servis Edildi'}
          </button>
        )}
      </div>
    </div>
  );
}