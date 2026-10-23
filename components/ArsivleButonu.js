'use client';
import { useTransition } from 'react';
import { Archive } from 'lucide-react';

export default function ArsivleButonu({ id, action, etiket = 'Arşivle' }) {
    const [pending, startTransition] = useTransition();

    const handle = () => {
        if (!confirm('Bu fatura arşivlenecek. Stok ve kasa etkilenmez. Onaylıyor musun?')) return;
        const neden = prompt('Arşiv nedeni (opsiyonel):') ?? null;
        startTransition(async () => {
            const res = await action(id, neden);
            if (res?.error) alert(res.error);
        });
    };

    return (
        <button
            type="button"
            onClick={handle}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-amber-700 hover:bg-amber-50 border border-amber-200 px-3 py-2 rounded text-sm transition disabled:opacity-50"
            title="Arşivle (stoğa dokunmaz)"
        >
            <Archive size={16} strokeWidth={2} />
            {pending ? 'Arşivleniyor…' : etiket}
        </button>
    );
}