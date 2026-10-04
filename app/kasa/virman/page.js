import Link from 'next/link';
import { aktifKasaHesaplari } from '@/models/kasaModel';
import VirmanForm from '@/components/kasa/VirmanForm';

export const dynamic = 'force-dynamic';

export default async function VirmanPage() {
  const kasaHesaplari = await aktifKasaHesaplari();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Virman</h1>
          <p className="text-sm text-gray-500">
            Kasa hesapları arasında para transferi
          </p>
        </div>
        <Link href="/kasa" className="text-blue-600 hover:underline">
          ← Kasa
        </Link>
      </div>

      {kasaHesaplari.length < 2 ? (
        <div className="border rounded p-4 bg-yellow-50 text-yellow-700">
          Virman yapmak için en az 2 kasa hesabı gerekir.
          <Link href="/kasa/hesaplar/yeni" className="underline ml-2">
            + Yeni Kasa
          </Link>
        </div>
      ) : (
        <VirmanForm kasaHesaplari={kasaHesaplari} />
      )}

      <div className="border rounded p-4 bg-gray-50 text-sm text-gray-600 space-y-2">
        <div className="font-semibold">Örnek senaryolar:</div>
        <ul className="list-disc list-inside space-y-1">
          <li><b>Bankadan nakit çekme:</b> Kaynak → Ziraat, Hedef → Merkez Nakit</li>
          <li><b>Nakiti bankaya yatırma:</b> Kaynak → Merkez Nakit, Hedef → Ziraat</li>
          <li><b>Bankalar arası transfer:</b> Kaynak → Ziraat, Hedef → İş Bankası</li>
        </ul>
      </div>
    </div>
  );
}