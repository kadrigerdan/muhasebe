'use client';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cariEkleAction, cariGuncelleAction } from '@/actions/cariActions';

export default function CariForm({ initial, onSuccess }) {
    const router = useRouter();
    const action = initial
        ? cariGuncelleAction.bind(null, initial.id)
        : cariEkleAction;
    const [state, formAction, pending] = useActionState(action, null);

    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();
            else router.push('/cariler');
        }
    }, [state, onSuccess, router]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
            )}

            <div>
                <label className="block font-medium mb-1">Ünvan *</label>
                <input type="text" name="unvan" required maxLength={255}
                    defaultValue={initial?.unvan ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium mb-1">Tip *</label>
                <select name="tip" required defaultValue={initial?.tip ?? 'her_ikisi'}
                    className="w-full border rounded px-3 py-2">
                    <option value="tedarikci">Tedarikçi</option>
                    <option value="musteri">Müşteri</option>
                    <option value="her_ikisi">Her İkisi (Tedarikçi + Müşteri)</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Telefon</label>
                    <input type="text" name="telefon" maxLength={20}
                        defaultValue={initial?.telefon ?? ''}
                        className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block font-medium mb-1">E-posta</label>
                    <input type="email" name="email" maxLength={150}
                        defaultValue={initial?.email ?? ''}
                        className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Vergi No</label>
                    <input type="text" name="vergi_no" maxLength={20}
                        defaultValue={initial?.vergi_no ?? ''}
                        className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Vergi Dairesi</label>
                    <input type="text" name="vergi_dairesi" maxLength={100}
                        defaultValue={initial?.vergi_dairesi ?? ''}
                        className="w-full border rounded px-3 py-2" />
                </div>
            </div>

            <div>
                <label className="block font-medium mb-1">Yetkili</label>
                <input type="text" name="yetkili" maxLength={100}
                    defaultValue={initial?.yetkili ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium mb-1">Adres</label>
                <textarea name="adres" rows={3}
                    defaultValue={initial?.adres ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <button type="submit" disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
            </button>
        </form>
    );
}