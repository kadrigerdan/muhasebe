'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { kasaEkleAction, kasaGuncelleAction } from '@/actions/kasaActions';

export default function KasaForm({ initial, onSuccess }) {
    const router = useRouter();
    const action = initial
        ? kasaGuncelleAction.bind(null, initial.id)
        : kasaEkleAction;
    const [state, formAction, pending] = useActionState(action, null);

    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();
            else router.push('/kasa');
        }
    }, [state, onSuccess, router]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
            )}

            <div>
                <label className="block font-medium mb-1">Kasa Adı *</label>
                <input type="text" name="ad" required maxLength={100}
                    defaultValue={initial?.ad ?? ''}
                    placeholder="Merkez Nakit / Ziraat TL"
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium mb-1">Tip *</label>
                <select name="tip" required defaultValue={initial?.tip ?? 'nakit'}
                    className="w-full border rounded px-3 py-2">
                    <option value="nakit">Nakit</option>
                    <option value="banka">Banka</option>
                    <option value="pos">POS</option>
                </select>
            </div>

            <div>
                <label className="block font-medium mb-1">Banka Adı</label>
                <input type="text" name="banka_adi" maxLength={100}
                    defaultValue={initial?.banka_adi ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium mb-1">IBAN</label>
                <input type="text" name="iban" maxLength={34}
                    defaultValue={initial?.iban ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium mb-1">Açılış Bakiyesi</label>
                <input type="number" name="acilis_bakiye" step="0.01"
                    defaultValue={initial?.acilis_bakiye ?? 0}
                    className="w-full border rounded px-3 py-2" />
            </div>

            {initial && (
                <div className="flex items-center gap-2">
                    <input type="checkbox" name="aktif" id="aktif"
                        defaultChecked={initial.aktif === 1} />
                    <label htmlFor="aktif" className="text-sm">Aktif</label>
                </div>
            )}

            <button type="submit" disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
            </button>
        </form>
    );
}