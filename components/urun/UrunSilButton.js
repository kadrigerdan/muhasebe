'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { urunSilAction } from '@/actions/urunActions';

export default function UrunSilButton({ id }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleDelete() {
        if (!confirm('Bu ürünü silmek istediğine emin misin?')) return;
        startTransition(async () => {
            const res = await urunSilAction(id);
            if (res?.error) setError(res.error);
            else router.refresh();
        });
    }

    return (
        <>
            <button onClick={handleDelete} disabled={pending}
                className="text-red-600 hover:underline disabled:opacity-50">
                {pending ? 'Siliniyor...' : 'Sil'}
            </button>
            {error && <span className="text-red-500 ml-2">{error}</span>}
        </>
    );
}