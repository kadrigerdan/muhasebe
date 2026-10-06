'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { yedekAlAction } from '@/actions/yedeklemeActions';

export default function YedekAlButton() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [mesaj, setMesaj] = useState(null);
    const [hata, setHata] = useState(null);

    function handleYedekAl() {
        setMesaj(null);
        setHata(null);
        startTransition(async () => {
            const res = await yedekAlAction();
            if (res?.error) {
                setHata(res.error);
            } else {
                setMesaj(`Yedek alındı: ${res.dosya} (${(res.boyut / 1024).toFixed(0)} KB)`);
                router.refresh();
            }
        });
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleYedekAl}
                disabled={pending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {pending ? 'Yedek alınıyor...' : '💾 Sadece DB Yedek Al'}
            </button>
            {mesaj && (
                <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
                    ✓ {mesaj}
                </div>
            )}
            {hata && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                    {hata}
                </div>
            )}
        </div>
    );
}