'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { masaAcAction } from '@/actions/adisyonActions';
import { paraFormat } from '@/lib/format';

export default function MasaGrid({ masalar }) {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(null);

  async function masaTikla(masa) {
    setYukleniyor(masa.id);

    // Adisyon yoksa aç, varsa mevcut ID'yi al
    const res = await masaAcAction(masa.id);

    if (res?.error) {
      alert(res.error);
      setYukleniyor(null);
      return;
    }

    router.push(`/restoran/${res.adisyon_id}`);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {masalar.map((m) => {
        const dolu = m.adisyon_id !== null;
        const sure = m.acilis_tarih
          ? Math.floor((Date.now() - new Date(m.acilis_tarih).getTime()) / 60000)
          : 0;

        return (
          <button
            key={String(m.id)}
            onClick={() => masaTikla(m)}
            disabled={yukleniyor === m.id}
            className={`relative border-2 rounded-lg p-6 text-left transition hover:shadow-lg disabled:opacity-50 min-h-35  ${dolu
              ? 'bg-red-50 border-red-400 hover:bg-red-100'
              : 'bg-green-50 border-green-400 hover:bg-green-100'
              }`}
          >
            {/* Masa adı */}
            <div className="text-xl font-bold mb-3 flex items-center justify-between">
              <span>{m.ad}</span>
              <span className="text-xs">
                {m.tip === 'masa' && '🍽️'}
                {m.tip === 'paket' && '🥡'}
                {m.tip === 'gelal' && '🛍️'}
              </span>
            </div>

            {/* Durum */}
            {dolu ? (
              <>
                <div className="text-sm text-gray-600 mb-1">
                  {String(m.kalem_sayisi)} kalem
                </div>
                <div className="text-2xl font-bold text-red-700 mb-1">
                  {paraFormat(m.adisyon_toplam)} ₺
                </div>
                <div className="text-xs text-gray-500">
                  {sure} dk önce açıldı
                </div>
              </>
            ) : (
              <div className="text-sm text-green-700 font-medium">
                ✓ Boş — tıkla aç
              </div>
            )}

            {yukleniyor === m.id && (
              <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-600">Açılıyor...</span>
              </div>
            )}
          </button>
        );
      })}

      {masalar.length === 0 && (
        <div className="col-span-full text-center text-gray-500 p-6">
          Masa bulunamadı.
        </div>
      )}
    </div>
  );
}
