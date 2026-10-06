'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { yedekSilAction } from '@/actions/yedeklemeActions';

export default function YedekSilButton({ dosya }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    function handleSil() {
        if (!confirm(`"${dosya}" silinsin mi?`)) return;
        startTransition(async () => {
            const res = await yedekSilAction(dosya);
            if (res?.error) setError(res.error);
            else router.refresh();
        });
    }

    return (
        <>
            <button
                onClick={handleSil}
                disabled={pending}
                className="text-red-600 hover:underline disabled:opacity-50 text-sm"
            >
                {pending ? 'Siliniyor...' : 'Sil'}
            </button>
            {error && <span className="text-red-500 ml-2 text-xs">{error}</span>}
        </>
    );
}