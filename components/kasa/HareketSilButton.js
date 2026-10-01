'use client';

import { useState, useTransition } from 'react';
import { kasaHareketSilAction } from '@/actions/kasaActions';

export default function HareketSilButton({ id }) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleDelete() {
        if (!confirm('Bu hareketi silmek istediğine emin misin?')) return;
        startTransition(async () => {
            const res = await kasaHareketSilAction(id);
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
            {error && (
                <span className="text-red-500 ml-1 text-xs">{error}</span>
            )}
        </>
    );
}