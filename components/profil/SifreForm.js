'use client';

import { useActionState, useEffect, useState } from 'react';
import { sifreDegistirAction } from '@/actions/profilActions';

export default function SifreForm() {
  const [state, formAction, pending] = useActionState(sifreDegistirAction, null);
  const [basari, setBasari] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setBasari(true);
      setTimeout(() => setBasari(false), 4000);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
          {state.error}
        </div>
      )}
      {basari && (
        <div className="bg-green-100 text-green-700 p-3 rounded text-sm">
          ✓ Şifreniz güncellendi
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Mevcut Şifre *</label>
        <input
          type="password"
          name="mevcut_sifre"
          required
          autoComplete="current-password"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Yeni Şifre *</label>
        <input
          type="password"
          name="yeni_sifre"
          required
          minLength={4}
          autoComplete="new-password"
          className="w-full border rounded px-3 py-2"
        />
        <div className="text-xs text-gray-500 mt-1">En az 4 karakter</div>
      </div>

      <div>
        <label className="block font-medium mb-1">Yeni Şifre (Tekrar) *</label>
        <input
          type="password"
          name="yeni_sifre_tekrar"
          required
          minLength={4}
          autoComplete="new-password"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
      >
        {pending ? 'Kaydediliyor...' : '🔒 Şifreyi Değiştir'}
      </button>
    </form>
  );
}
