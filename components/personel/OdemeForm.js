'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { odemeEkleAction } from '@/actions/personelActions';

export default function OdemeForm({ personelId, kasaHesaplari }) {
    const router = useRouter();
    const formRef = useRef(null);
    const [kasadanDus, setKasadanDus] = useState(false);
    const [state, formAction, pending] = useActionState(odemeEkleAction, null);

    useEffect(() => {
        if (state?.ok) {
            formRef.current?.reset();
            setKasadanDus(false);
            router.refresh();
        }
    }, [state, router]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-3 border rounded p-4 bg-gray-50"
        >
            <h3 className="font-semibold">Yeni Ödeme</h3>

            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
                    {state.error}
                </div>
            )}

            <input type="hidden" name="personel_id" value={personelId} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Ödeme Tipi *</label>
                    <select name="odeme_tipi" required className="w-full border rounded px-3 py-2">
                        <option value="maas">Maaş</option>
                        <option value="avans">Avans</option>
                        <option value="prim">Prim</option>
                        <option value="ikramiye">İkramiye</option>
                        <option value="kesinti">Kesinti</option>
                        <option value="diger">Diğer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tutar *</label>
                    <input type="number" name="tutar" step="0.01" min="0" required
                        placeholder="0.00"
                        className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tarih *</label>
                    <input type="date" name="tarih" required
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Dönem</label>
                    <input type="text" name="donem" placeholder="2026-10" maxLength={7}
                        className="w-full border rounded px-3 py-2" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <input type="text" name="aciklama" maxLength={255}
                    placeholder="Ödeme ile ilgili not"
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" name="kasadan_dus" id="kasadan_dus"
                    checked={kasadanDus}
                    onChange={(e) => setKasadanDus(e.target.checked)} />
                <label htmlFor="kasadan_dus" className="text-sm">Kasadan düşülsün</label>
            </div>

            {kasadanDus && (
                <div>
                    <label className="block text-sm font-medium mb-1">Kasa *</label>
                    <select name="kasa_id" required
                        className="w-full border rounded px-3 py-2">
                        <option value="">-- Kasa Seç --</option>
                        {kasaHesaplari.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.ad} — bakiye: {Number(k.bakiye).toFixed(2)} ₺
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button type="submit" disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {pending ? 'Kaydediliyor...' : 'Ödemeyi Kaydet'}
            </button>
        </form>
    );
}