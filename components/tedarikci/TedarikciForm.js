'use client';
import { useActionState, useEffect } from 'react';
import { tedarikciEkleAction, tedarikciGuncelleAction } from '@/actions/tedarikciActions';
import { useRouter } from 'next/navigation';

export default function TedarikciForm({ initial, onSuccess }) {

    const router = useRouter();
    const action = initial
        ? tedarikciGuncelleAction.bind(null, initial.id)
        : tedarikciEkleAction;

    const [state, formAction, pending] = useActionState(action, null);

    // state.ok gelince yönlendir
    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();          // modal varsa kapat
            else router.push('/tedarikciler');   // değilse listeye dön
        }
    }, [state, onSuccess, router]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block font-medium mb-1">Ünvan *</label>
                <input
                    type="text"
                    name="unvan"
                    required
                    maxLength={255}
                    defaultValue={initial?.unvan ?? ''}
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Telefon</label>
                <input
                    type="text"
                    name="telefon"
                    maxLength={20}
                    defaultValue={initial?.telefon ?? ''}
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Adres</label>
                <textarea
                    name="adres"
                    rows={3}
                    defaultValue={initial?.adres ?? ''}
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}