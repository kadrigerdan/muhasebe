'use client';

import { useActionState } from 'react';
import { girisAction } from '@/actions/authActions';

export default function GirisForm({ donus = '/' }) {
  const [state, formAction, pending] = useActionState(girisAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="donus" value={donus} />

      <div>
        <label className="block font-medium mb-1">Kullanıcı Adı</label>
        <input
          type="text"
          name="kullanici_adi"
          required
          autoComplete="username"
          autoFocus
          className="w-full border rounded px-3 py-2 text-base"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Şifre</label>
        <input
          type="password"
          name="sifre"
          required
          autoComplete="current-password"
          className="w-full border rounded px-3 py-2 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Giriş yapılıyor...' : '🔓 Giriş Yap'}
      </button>
    </form>
  );
}
