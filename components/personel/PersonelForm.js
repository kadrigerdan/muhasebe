'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { personelEkleAction, personelGuncelleAction } from '@/actions/personelActions';

export default function PersonelForm({ initial, onSuccess }) {
    const router = useRouter();
    const action = initial
        ? personelGuncelleAction.bind(null, initial.id)
        : personelEkleAction;
    const [state, formAction, pending] = useActionState(action, null);

    function tarihInput(deger) {
        if (!deger) return '';
        if (deger instanceof Date) {
            return deger.toISOString().slice(0, 10);
        }
        return String(deger).slice(0, 10);
    }

    useEffect(() => {
        if (state?.ok) {
            if (onSuccess) onSuccess();
            else router.push('/personel');
        }
    }, [state, onSuccess, router]);

    const egitimSecenekleri = [
        ['', '-- Seç --'],
        ['ilkokul', 'İlkokul'],
        ['ortaokul', 'Ortaokul'],
        ['lise', 'Lise'],
        ['onlisans', 'Ön Lisans'],
        ['lisans', 'Lisans'],
        ['yuksek_lisans', 'Yüksek Lisans'],
        ['doktora', 'Doktora'],
    ];

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">{state.error}</div>
            )}

            {/* KİMLİK */}
            <fieldset className="border rounded p-4 space-y-3">
                <legend className="font-semibold px-2">Kimlik Bilgileri</legend>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ad *</label>
                        <input type="text" name="ad" required maxLength={100}
                            defaultValue={initial?.ad ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Soyad *</label>
                        <input type="text" name="soyad" required maxLength={100}
                            defaultValue={initial?.soyad ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">TC Kimlik</label>
                        <input type="text" name="tc_kimlik" maxLength={11}
                            defaultValue={initial?.tc_kimlik ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">SGK No</label>
                        <input type="text" name="sgk_no" maxLength={20}
                            defaultValue={initial?.sgk_no ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Doğum Tarihi</label>
                        <input type="date" name="dogum_tarihi"
                            defaultValue={tarihInput(initial?.dogum_tarihi)}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Eğitim Durumu</label>
                        <select name="egitim_durumu"
                            defaultValue={initial?.egitim_durumu ?? ''}
                            className="w-full border rounded px-3 py-2">
                            {egitimSecenekleri.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            {/* İLETİŞİM */}
            <fieldset className="border rounded p-4 space-y-3">
                <legend className="font-semibold px-2">İletişim</legend>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefon</label>
                        <input type="text" name="telefon" maxLength={20}
                            defaultValue={initial?.telefon ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">E-posta</label>
                        <input type="email" name="email" maxLength={150}
                            defaultValue={initial?.email ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Adres</label>
                    <textarea name="adres" rows={2}
                        defaultValue={initial?.adres ?? ''}
                        className="w-full border rounded px-3 py-2" />
                </div>
            </fieldset>

            {/* İŞ BİLGİLERİ */}
            <fieldset className="border rounded p-4 space-y-3">
                <legend className="font-semibold px-2">İş Bilgileri</legend>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">İşe Giriş *</label>
                        <input type="date" name="ise_giris_tarihi" required
                            defaultValue={
                                initial
                                    ? tarihInput(initial.ise_giris_tarihi)
                                    : new Date().toISOString().slice(0, 10)
                            }
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">İşten Çıkış</label>
                        <input type="date" name="isten_cikis_tarihi"
                            defaultValue={tarihInput(initial?.isten_cikis_tarihi)}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Görev</label>
                        <input type="text" name="gorev" maxLength={100}
                            defaultValue={initial?.gorev ?? ''}
                            placeholder="Satış Temsilcisi"
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Departman</label>
                        <input type="text" name="departman" maxLength={100}
                            defaultValue={initial?.departman ?? ''}
                            placeholder="Satış"
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Aylık Maaş</label>
                        <input type="number" name="maas" step="0.01" min="0"
                            defaultValue={initial?.maas ?? 0}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="aktif"
                                defaultChecked={initial ? initial.aktif === 1 : true} />
                            <span className="text-sm">Aktif</span>
                        </label>
                    </div>
                </div>
            </fieldset>

            {/* EHLİYET */}
            <fieldset className="border rounded p-4 space-y-3">
                <legend className="font-semibold px-2">Ehliyet</legend>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ehliyet Sınıfı</label>
                        <input type="text" name="ehliyet_sinifi" maxLength={10}
                            defaultValue={tarihInput(initial?.ehliyet_tarihi)}
                            placeholder="B, C, A2..."
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ehliyet Tarihi</label>
                        <input type="date" name="ehliyet_tarihi"
                            defaultValue={initial?.ehliyet_tarihi?.slice(0, 10) ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                </div>
            </fieldset>

            {/* BANKA */}
            <fieldset className="border rounded p-4 space-y-3">
                <legend className="font-semibold px-2">Banka</legend>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Banka Adı</label>
                        <input type="text" name="banka_adi" maxLength={100}
                            defaultValue={initial?.banka_adi ?? ''}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">IBAN</label>
                        <input type="text" name="iban" maxLength={34}
                            defaultValue={initial?.iban ?? ''}
                            placeholder="TR.."
                            className="w-full border rounded px-3 py-2" />
                    </div>
                </div>
            </fieldset>

            <div>
                <label className="block text-sm font-medium mb-1">Notlar</label>
                <textarea name="notlar" rows={2}
                    defaultValue={initial?.notlar ?? ''}
                    className="w-full border rounded px-3 py-2" />
            </div>

            <button type="submit" disabled={pending}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Kaydet'}
            </button>
        </form>
    );
}