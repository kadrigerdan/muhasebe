'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ayarlarKaydetAction } from '@/actions/ayarlarActions';

export default function AyarlarForm({ initial }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(ayarlarKaydetAction, null);
  const [basari, setBasari] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setBasari(true);
      router.refresh();
      setTimeout(() => setBasari(false), 3000);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{state.error}</div>
      )}
      {basari && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          ✓ Ayarlar kaydedildi
        </div>
      )}

      {/* Şirket Bilgileri */}
      <fieldset className="border rounded-lg p-4 space-y-4">
        <legend className="font-bold px-2">Şirket Bilgileri</legend>

        <div>
          <label className="block font-medium mb-1">Şirket Adı *</label>
          <input
            type="text"
            name="sirket_adi"
            required
            maxLength={255}
            defaultValue={initial?.sirket_adi ?? ''}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Adres</label>
          <textarea
            name="adres"
            rows={2}
            defaultValue={initial?.adres ?? ''}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Telefon</label>
            <input
              type="text"
              name="telefon"
              maxLength={20}
              defaultValue={initial?.telefon ?? ''}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              maxLength={150}
              defaultValue={initial?.email ?? ''}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Vergi No</label>
            <input
              type="text"
              name="vergi_no"
              maxLength={20}
              defaultValue={initial?.vergi_no ?? ''}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Vergi Dairesi</label>
            <input
              type="text"
              name="vergi_dairesi"
              maxLength={100}
              defaultValue={initial?.vergi_dairesi ?? ''}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Logo URL (opsiyonel)</label>
          <input
            type="text"
            name="logo_url"
            maxLength={255}
            defaultValue={initial?.logo_url ?? ''}
            placeholder="https://..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </fieldset>

      {/* Fiş ve Fatura Notları */}
      <fieldset className="border rounded-lg p-4 space-y-4">
        <legend className="font-bold px-2">Belge Alt Notları</legend>

        <div>
          <label className="block font-medium mb-1">Fatura Alt Notu</label>
          <input
            type="text"
            name="fatura_alt_not"
            maxLength={255}
            defaultValue={initial?.fatura_alt_not ?? ''}
            placeholder="Örn: Ödeme için 30 gün vade"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Fiş Alt Notu</label>
          <input
            type="text"
            name="fis_alt_not"
            maxLength={255}
            defaultValue={initial?.fis_alt_not ?? ''}
            placeholder="Örn: Afiyet olsun! Bizi tercih ettiğiniz için teşekkürler."
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-bold"
      >
        {pending ? 'Kaydediliyor...' : '✓ Kaydet'}
      </button>
    </form>
  );
}
