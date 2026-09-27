'use client';

import { useState, useTransition } from 'react';
import { tedarikciSilAction } from '@/actions/tedarikciActions';

export default function TedarikciDeleteButton({ id }) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleDelete() {
        if (!confirm('Bu tedarikçiyi silmek istediğine emin misin?')) return;
        startTransition(async () => {
            const res = await tedarikciSil(id);
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