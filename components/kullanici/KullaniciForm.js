'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  kullaniciEkleAction,
  kullaniciGuncelleAction,
} from '@/actions/kullaniciActions';

export default function KullaniciForm({ initial }) {
  const router = useRouter();
  const action = initial
    ? kullaniciGuncelleAction.bind(null, initial.id)
    : kullaniciEkleAction;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) router.push('/kullanicilar');
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{state.error}</div>
      )}

      <div>
        <label className="block font-medium mb-1">Ad Soyad *</label>
        <input
          type="text"
          name="ad_soyad"
          required
          maxLength={100}
          defaultValue={initial?.ad_soyad ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Kullanıcı Adı *</label>
        <input
          type="text"
          name="kullanici_adi"
          required
          maxLength={50}
          autoComplete="off"
          defaultValue={initial?.kullanici_adi ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          {initial ? 'Yeni Şifre (boş bırak = değişmez)' : 'Şifre *'}
        </label>
        <input
          type="password"
          name={initial ? 'yeni_sifre' : 'sifre'}
          required={!initial}
          minLength={4}
          autoComplete="new-password"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Rol *</label>
        <select
          name="rol"
          required
          defaultValue={initial?.rol ?? 'personel'}
          className="w-full border rounded px-3 py-2"
        >
          <option value="personel">Personel</option>
          <option value="admin">Yönetici</option>
        </select>
      </div>

      {initial && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="aktif"
            id="aktif"
            defaultChecked={initial.aktif === 1}
          />
          <label htmlFor="aktif">Aktif</label>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/kullanicilar')}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
