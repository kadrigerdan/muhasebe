'use client';

import { useState, useTransition } from 'react';
import { odemeSilAction } from '@/actions/personelActions';

export default function OdemeSilButton({ id, personelId }) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleDelete() {
        if (!confirm('Bu ödemeyi silmek istediğine emin misin? Kasadan düşüldüyse geri eklenecek.')) return;
        startTransition(async () => {
            const res = await odemeSilAction(id, personelId);
            if (res?.error) setError(res.error);
        });
    }

    return (
        <>
            <button
                onClick={handleDelete}
                disabled={pending}
                className="text-red-600 hover:underline disabled:opacity-50 text-xs"
            >
                {pending ? 'Siliniyor...' : 'Sil'}
            </button>
            {error && <span className="text-red-500 ml-1 text-xs">{error}</span>}
        </>
    );
}