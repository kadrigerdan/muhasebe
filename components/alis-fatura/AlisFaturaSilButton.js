'use client';

import { useState, useTransition } from 'react';
import { alisFaturaSilAction } from '@/actions/alisFaturaActions';

export default function AlisFaturaSilButton({ id }) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleDelete() {
        if (!confirm('Fatura silinsin mi? Stok geri düşülecek.')) return;
        startTransition(async () => {
            const res = await alisFaturaSilAction(id);
            if (res?.error) setError(res.error);
        });
    }

    return (
        <>
            <button
                onClick={handleDelete}
                disabled={pending}
                className="text-red-600 hover:underline disabled:opacity-50"
            >
                {pending ? 'Siliniyor...' : 'Sil'}
            </button>
            {error && <span className="text-red-500 ml-2">{error}</span>}
        </>
    );
}