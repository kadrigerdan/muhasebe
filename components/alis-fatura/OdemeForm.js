'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { alisFaturaOdemeAction } from '@/actions/alisFaturaActions';
import { paraFormat } from '@/lib/format';

export default function OdemeForm({ faturaId, kalan, kasaHesaplari }) {
    const router = useRouter();
    const formRef = useRef(null);
    const [state, formAction, pending] = useActionState(alisFaturaOdemeAction, null);

    useEffect(() => {
        if (state?.ok) {
            formRef.current?.reset();
            router.refresh();
        }
    }, [state, router]);

    if (kalan <= 0.01) {
        return (
            <div className="border rounded p-4 bg-green-50 text-green-700 text-sm">
                ✓ Bu fatura tamamen ödendi.
            </div>
        );
    }

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-3 border rounded p-4 bg-gray-50"
        >
            <h3 className="font-semibold">Ödeme Yap</h3>

            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                    {state.error}
                </div>
            )}

            <input type="hidden" name="fatura_id" value={faturaId} />
            <input type="hidden" name="kasadan_dus" value="on" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Tutar *</label>
                    <input
                        type="number"
                        name="tutar"
                        step="0.01"
                        min="0.01"
                        max={kalan}
                        required
                        defaultValue={kalan.toFixed(2)}
                        className="w-full border rounded px-3 py-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Kalan: {paraFormat(kalan)} ₺
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tarih *</label>
                    <input
                        type="date"
                        name="tarih"
                        required
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Kasa *</label>
                    <select
                        name="kasa_id"
                        required
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="">-- Kasa Seç --</option>
                        {kasaHesaplari.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.ad} — bakiye: {paraFormat(k.bakiye)} ₺
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                        {pending ? 'Kaydediliyor...' : 'Ödeme Yap'}
                    </button>
                </div>
            </div>
        </form>
    );
}