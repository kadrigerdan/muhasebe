import { notFound } from 'next/navigation';
import Link from 'next/link';
import { satisFaturaGetir, satisFaturaIadeEdilebilir } from '@/models/satisFaturaModel';
import { query } from '@/database/db';
import IadeForm from '@/components/satis-fatura/IadeForm';

export const dynamic = 'force-dynamic';

export default async function SatisIadePage({ params }) {
    const p = await params;
    const id = Number(p.id);
    if (!id || Number.isNaN(id)) notFound();

    const fatura = await satisFaturaGetir(id);
    if (!fatura) notFound();

    if (fatura.fatura_tipi === 'iade') {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded">
                    İade faturasının iadesi yapılamaz.{' '}
                    <Link href={`/satis-faturalar/${id}`} className="underline">Faturaya dön</Link>
                </div>
            </div>
        );
    }

    const kalemler = await satisFaturaIadeEdilebilir(id);
    const iadeEdilebilirVar = kalemler.some((k) => Number(k.iade_edilebilir) > 0);

    if (!iadeEdilebilirVar) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-slate-50 border p-4 rounded">
                    Bu faturadaki tüm kalemler zaten iade edilmiş.{' '}
                    <Link href={`/satis-faturalar/${id}`} className="underline">Faturaya dön</Link>
                </div>
            </div>
        );
    }

    // 🔽🔽🔽 SORGU BURAYA — erken return'lerden sonra, JSX'ten önce
    const musteriBorc = await query(`
        SELECT COALESCE(SUM(
          (SELECT COALESCE(SUM(d.adet * d.birim_fiyat), 0)
             FROM satis_fatura_detaylari d WHERE d.fatura_id = f.id)
          - COALESCE(f.odenen_tutar, 0)
        ), 0) AS toplam_borc
          FROM satis_faturalar f
         WHERE f.cari_id = ?
           AND f.fatura_tipi = 'normal'
           AND f.arsivlendi = 0
           AND f.durum IN ('odenmedi', 'kismi')
    `, [fatura.cari_id]);

    const toplamBorc = Number(musteriBorc[0]?.toplam_borc ?? 0);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">↩️ Satış İadesi — Fatura #{fatura.id}</h1>
            <div className="text-sm text-gray-600">
                Müşteri: <b>{fatura.cari_unvan}</b> · Orijinal Tarih:{' '}
                {new Date(fatura.tarih).toLocaleDateString('tr-TR')}
                {' · '}
                <span className="text-gray-700">
                    Toplam Borç:{' '}
                    <b className={toplamBorc > 0 ? 'text-red-600' : 'text-green-600'}>
                        {toplamBorc.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </b>
                </span>
            </div>
            <IadeForm
                kaynakFaturaId={id}
                kalemler={kalemler}
                varsayilanTarih={new Date().toISOString().slice(0, 10)}
            // istersen: musteriBorc={toplamBorc}  (formda uyarı/limit için)
            />
        </div>
    );
}