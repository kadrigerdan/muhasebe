'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { urunEkleAction, urunGuncelleAction } from '@/actions/urunActions';

export default function UrunForm({ initial, onSuccess }) {
    const router = useRouter();
    const action = initial
        ? urunGuncelleAction.bind(null, initial.id)
        : urunEkleAction;
    const [state, formAction, pending] = useActionState(action, null);

    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();
            else router.push('/urunler');
        }
    }, [state, onSuccess, router]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
            )}

            <div>
                <label className="block font-medium mb-1">Ürün Adı *</label>
                <input type="text" name="urun_adi" required maxLength={255}
                    defaultValue={initial?.urun_adi ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Alış Fiyatı</label>
                    <input type="number" name="varsayilan_alis_fiyati" step="0.01" min="0"
                        defaultValue={initial?.varsayilan_alis_fiyati ?? 0}
                        className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Satış Fiyatı</label>
                    <input type="number" name="varsayilan_satis_fiyati" step="0.01" min="0"
                        defaultValue={initial?.varsayilan_satis_fiyati ?? 0}
                        className="w-full border rounded px-3 py-2" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Kritik Seviye</label>
                    <input type="number" name="kritik_seviye" min="0"
                        defaultValue={initial?.kritik_seviye ?? 10}
                        className="w-full border rounded px-3 py-2" />
                    <div className="text-xs text-gray-500 mt-1">
                        Stok bu seviyeye düşünce uyarı verir
                    </div>
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="durum"
                            defaultChecked={initial ? initial.durum === 1 : true} />
                        <span className="text-sm">Aktif</span>
                    </label>
                </div>
            </div>

            {initial && (
                <div className="border rounded p-3 bg-gray-50 text-sm">
                    <div className="text-gray-500">Mevcut Stok</div>
                    <div className="font-bold">{String(initial.stok)} adet</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Stok, fatura ve manuel hareket ile değişir. Buradan değiştirilemez.
                    </div>
                </div>
            )}

            <button type="submit" disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
            </button>
        </form>
    );
}