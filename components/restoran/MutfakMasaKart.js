'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  mutfakDurumAction,
  mutfakIptalAction,
} from '@/actions/adisyonActions';

export default function MutfakMasaKart({ masa }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState(null);

  const bekleyenler = masa.kalemler.filter(
    (k) => k.mutfak_durum === 'bekliyor'
  );
  const hazirlar = masa.kalemler.filter(
    (k) => k.mutfak_durum === 'hazir'
  );

  const acilis = new Date(masa.acilis);
  const sure = Math.floor((Date.now() - acilis.getTime()) / 60000);

  const kartRenk =
    bekleyenler.length > 0
      ? 'border-orange-400 bg-orange-50'
      : 'border-green-400 bg-green-50';

  function kalemDurum(kalemId, yeniDurum) {
    setHata(null);
    startTransition(async () => {
      const res = await mutfakDurumAction(kalemId, yeniDurum);
      if (res?.error) setHata(res.error);
      else router.refresh();
    });
  }

  function kalemIptal(kalemId, urunAdi, adet) {
    if (
      !confirm(
        `"${urunAdi} × ${adet}" iptal edilsin mi?\n\nFİRE olarak kaydedilecek.`
      )
    )
      return;
    setHata(null);
    startTransition(async () => {
      const res = await mutfakIptalAction(kalemId);
      if (res?.error) setHata(res.error);
      else router.refresh();
    });
  }

  async function hepsiniHazirla() {
    setHata(null);
    for (const k of bekleyenler) {
      const res = await mutfakDurumAction(k.id, 'hazir');
      if (res?.error) {
        setHata(res.error);
        return;
      }
    }
    router.refresh();
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${kartRenk}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
        <div className="font-bold text-lg">
          {masa.masa_ad}
          {masa.masa_tip === 'paket' && ' 🥡'}
          {masa.masa_tip === 'gelal' && ' 🛍️'}
          {masa.masa_tip === 'masa' && ' 🍽️'}
        </div>
        <div className="text-xs text-gray-600">{sure} dk</div>
      </div>

      {hata && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-xs mb-2">
          {hata}
        </div>
      )}

      {/* Kalemler */}
      <div className="space-y-2 mb-3">
        {masa.kalemler.map((k) => (
          <div
            key={String(k.id)}
            className="flex items-center gap-2 bg-white rounded p-2 border"
          >
            <div className="flex-1">
              <div className="font-bold">{k.urun_adi}</div>
              <div className="text-2xl font-bold text-blue-700">
                × {String(k.adet)}
              </div>
            </div>

            <div className="flex gap-1">
              {k.mutfak_durum === 'bekliyor' && (
                <>
                  <button
                    onClick={() => kalemDurum(k.id, 'hazir')}
                    disabled={pending}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    title="Hazır"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => kalemIptal(k.id, k.urun_adi, k.adet)}
                    disabled={pending}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 disabled:opacity-50 text-sm"
                    title="İptal (fire)"
                  >
                    🗑️
                  </button>
                </>
              )}
              {k.mutfak_durum === 'hazir' && (
                <button
                  onClick={() => kalemDurum(k.id, 'servis')}
                  disabled={pending}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  title="Servis Edildi"
                >
                  🍽️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Alt Butonlar */}
      {bekleyenler.length > 1 && (
        <button
          onClick={hepsiniHazirla}
          disabled={pending}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
        >
          {pending ? '...' : '✓ Hepsini Hazırla'}
        </button>
      )}
    </div>
  );
}
