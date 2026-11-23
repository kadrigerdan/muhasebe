// app/satis-faturalar/page.js
import Link from 'next/link';
import { tumSatisFaturalar, satisMaliOzet } from '@/models/satisFaturaModel';
import SatisFaturaList from '@/components/satis-fatura/SatisFaturaList';
import { paraFormat } from '@/lib/format';
import ExcelIndirButton from '@/components/ExcelIndirButton';
import { satisFaturalariExcelAction } from '@/actions/excelActions';

export const dynamic = 'force-dynamic';

export default async function SatisFaturaListPage({ searchParams }) {
  const sp = await searchParams;
  const gorunum = sp?.gorunum || 'aktif';

  const [faturalar, ozet] = await Promise.all([
    tumSatisFaturalar({ gorunum }),
    satisMaliOzet({ gorunum }),
  ]);

  return (
    <div className="w-full min-w-0 p-2">
      {/* Başlık */}
      <h1 className="text-2xl font-bold mb-3">Satış Faturaları</h1>

      {/* Sekmeler + Excel/Yeni */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="w-full gap-2 grid grid-cols-3">
          <Link
            href="/satis-faturalar?gorunum=aktif"
            className={
              gorunum === 'aktif'
                ? 'bg-blue-600 text-white px-3 py-1.5 rounded text-sm text-center'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50 text-center'
            }
          >
            Aktif
          </Link>
          <Link
            href="/satis-faturalar?gorunum=arsiv"
            className={
              gorunum === 'arsiv'
                ? 'bg-amber-600 text-white px-3 py-1.5 rounded text-sm text-center'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50 text-center'
            }
          >
            🗄️ Arşiv
          </Link>
          <Link
            href="/satis-faturalar?gorunum=tumu"
            className={
              gorunum === 'tumu'
                ? 'bg-slate-600 text-white px-3 py-1.5 rounded text-sm text-center'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50 text-center'
            }
          >
            Tümü
          </Link>
        </div>

        <div className="w-full gap-2 grid grid-cols-2 sm:grid-cols-4">
          <Link
            href="/satis-faturalar?gorunum=iade"
            className={
              gorunum === 'iade'
                ? 'bg-purple-600 text-white px-3 py-1.5 rounded text-sm text-center'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50 text-center'
            }
          >
            ↩️ İade
          </Link>
          <Link
            href="/satis-faturalar?gorunum=iade_kesilmis"
            className={
              gorunum === 'iade_kesilmis'
                ? 'bg-indigo-600 text-white px-3 py-1.5 rounded text-sm text-center'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50 text-center'
            }
          >
            ↩️ İade Kesilmiş
          </Link>

          <ExcelIndirButton action={satisFaturalariExcelAction}>
            📊 Excel İndir
          </ExcelIndirButton>
          <Link
            href="/satis-faturalar/yeni"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap text-center"
          >
            + Yeni Satış Faturası
          </Link>
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Tutar ₺</div>
          <div className="text-xl font-bold tabular-nums">
            {paraFormat(ozet?.toplam_tutar ?? 0)}
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Fatura Sayısı</div>
          <div className="text-xl font-bold tabular-nums">{String(ozet?.fatura_sayisi ?? 0)}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Toplam Miktar (Kg)</div>
          <div className="text-xl font-bold tabular-nums">{String(ozet?.toplam_adet ?? 0)}</div>
        </div>
      </div>

      {/* Liste */}
      <div className="mt-3">
        <SatisFaturaList faturalar={faturalar} />
      </div>
    </div>
  );
}