import Link from 'next/link';
import { tumSatisFaturalar, satisMaliOzet } from '@/models/satisFaturaModel';
import SatisFaturaList from '@/components/satis-fatura/SatisFaturaList';
import { paraFormat } from '@/lib/format';
import ExcelIndirButton from '@/components/ExcelIndirButton';
import { satisFaturalariExcelAction } from '@/actions/excelActions';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaListPage({ searchParams }) {
  const sp = await searchParams;
  const gorunum = sp?.gorunum || 'aktif'; // aktif | arsiv | tumu

  const [faturalar, ozet] = await Promise.all([
    tumSatisFaturalar({ gorunum }),
    satisMaliOzet({ gorunum }),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Satış Faturaları</h1>
        <div className="flex items-center gap-2">
          <ExcelIndirButton action={satisFaturalariExcelAction}>
            📊 Excel İndir
          </ExcelIndirButton>
          <Link
            href="/satis-faturalar/yeni"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Yeni Satış Faturası
          </Link>
        </div>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-2">
        <Link
          href="/satis-faturalar?gorunum=aktif"
          className={
            gorunum === 'aktif'
              ? 'bg-blue-600 text-white px-3 py-1.5 rounded text-sm'
              : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
          }
        >
          Aktif
        </Link>
        <Link
          href="/satis-faturalar?gorunum=arsiv"
          className={
            gorunum === 'arsiv'
              ? 'bg-amber-600 text-white px-3 py-1.5 rounded text-sm'
              : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
          }
        >
          🗄️ Arşiv
        </Link>
        <Link
          href="/satis-faturalar?gorunum=tumu"
          className={
            gorunum === 'tumu'
              ? 'bg-slate-600 text-white px-3 py-1.5 rounded text-sm'
              : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
          }
        >
          Tümü
        </Link>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Tutar</div>
          <div className="text-xl font-bold">
            {paraFormat(ozet.toplam_tutar)} ₺
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Fatura Sayısı</div>
          <div className="text-xl font-bold">{String(ozet.fatura_sayisi)}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Adet</div>
          <div className="text-xl font-bold">{String(ozet.toplam_adet)}</div>
        </div>
      </div>

      <SatisFaturaList faturalar={faturalar} />
    </div>
  );
}