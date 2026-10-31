'use client';
import { useTransition } from 'react';

export default function GeriAlButonu({ id, action }) {
  const [pending, startTransition] = useTransition();

  const handle = () => {
    if (!confirm('Bu fatura arşivden geri alınacak. Onaylıyor musun?')) return;
    startTransition(async () => {
      const res = await action(id);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-slate-700 hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded text-sm transition disabled:opacity-50"
      title="Arşivden geri al"
    >
      ↩️ {pending ? 'İşleniyor…' : 'Geri Al'}
    </button>
  );
}