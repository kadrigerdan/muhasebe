'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { alisFaturaEkleAction } from '@/actions/alisFaturaActions';
import AlisFaturaKalemEditor from './AlisFaturaKalemEditor';

export default function AlisFaturaForm({ cariler, urunler, onSuccess }) {
    const router = useRouter();
    const [kalemler, setKalemler] = useState([]);
    const [state, formAction, pending] = useActionState(alisFaturaEkleAction, null);

    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();
            else router.push('/alis-faturalar');
        }
    }, [state, onSuccess, router]);

    // Form submit öncesi validasyon + temizleme
    const onSubmit = (e) => {
        const gecerliKalemler = kalemler.filter(
            (k) => Number(k.urun_id) > 0 && Number(k.miktar) > 0
        );

        if (!gecerliKalemler.length) {
            e.preventDefault();
            alert('En az bir ürün ve miktar girmelisiniz.');
            return;
        }

        // Eksik satır varsa uyar (opsiyonel — boşları at, kalanı gönder)
        if (gecerliKalemler.length !== kalemler.length) {
            const onay = confirm(
                `${kalemler.length - gecerliKalemler.length} boş kalem atlanacak. Devam edilsin mi?`
            );
            if (!onay) {
                e.preventDefault();
                return;
            }
        }

        // Hidden input'u filtrelenmiş kalemlerle güncelle
        e.currentTarget.elements.kalemler.value = JSON.stringify(gecerliKalemler);
    };

    return (
        <form action={formAction} onSubmit={onSubmit} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
            )}

            <input
                type="hidden"
                name="kalemler"
                value={JSON.stringify(kalemler)}
                readOnly
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Tedarikçi *</label>
                    <select
                        name="cari_id"
                        required
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="">-- Seç --</option>
                        {cariler.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.unvan}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium mb-1">Tarih *</label>
                    <input
                        type="date"
                        name="tarih"
                        required
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
            </div>

            <AlisFaturaKalemEditor urunler={urunler} onChange={setKalemler} />

            <button
                type="submit"
                disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {pending ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
            </button>
        </form>
    );
}