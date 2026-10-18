'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { yedektenGeriYukleAction } from '@/actions/yedeklemeActions';

export default function YedekGeriYukleButton({ dosya }) {
    const router = useRouter();
    const [yukleniyor, setYukleniyor] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    async function handleClick() {
        const onay = confirm(
            `"${dosya}" dosyasından geri yüklenecek.\n\n` +
            `⚠️ DİKKAT: Mevcut veritabanı bu yedeğin içeriğiyle DEĞİŞTİRİLECEK.\n` +
            `Bu işlem geri alınamaz.\n\n` +
            `Güvenlik için mevcut durum otomatik olarak yedeklenecek.\n\n` +
            `Devam edilsin mi?`
        );
        if (!onay) return;

        setYukleniyor(true);
        try {
            const sonuc = await yedektenGeriYukleAction(dosya);

            if (sonuc.error) {
                alert('❌ Hata: ' + sonuc.error);
            } else {
                alert('✅ ' + (sonuc.mesaj || 'Geri yükleme tamamlandı.'));
                startTransition(() => router.refresh());
            }
        } catch (err) {
            alert('❌ Beklenmeyen hata: ' + err.message);
        } finally {
            setYukleniyor(false);
        }
    }

    const mesgul = yukleniyor || bekliyor;

    return (
        <button
            onClick={handleClick}
            disabled={mesgul}
            className="text-orange-600 hover:text-orange-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bu yedeği veritabanına geri yükle"
        >
            {mesgul ? 'Yükleniyor...' : 'Geri Yükle'}
        </button>
    );
}