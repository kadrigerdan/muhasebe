import Link from 'next/link';
import { tumAlisFaturalar, alisMaliOzet } from '@/models/alisFaturaModel';
import AlisFaturaList from '@/components/alis-fatura/AlisFaturaList';
import { paraFormat } from '@/lib/format';
import ExcelIndirButton from '@/components/ExcelIndirButton';
import { alisFaturalariExcelAction } from '@/actions/excelActions';

export const dynamic = 'force-dynamic';

export default async function AlisFaturaListPage({ searchParams }) {
  const sp = await searchParams;
  const gorunum = sp?.gorunum || 'aktif'; // aktif | arsiv | tumu

  const [faturalar, ozet] = await Promise.all([
    tumAlisFaturalar(), alisMaliOzet(),]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Alış Faturaları</h1>


      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Sol: sekmeler */}
        <div className="flex gap-2">
          <Link
            href="/alis-faturalar?gorunum=aktif"
            className={
              gorunum === 'aktif'
                ? 'bg-blue-600 text-white px-3 py-1.5 rounded text-sm'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
            }
          >
            Aktif
          </Link>
          <Link
            href="/alis-faturalar?gorunum=arsiv"
            className={
              gorunum === 'arsiv'
                ? 'bg-amber-600 text-white px-3 py-1.5 rounded text-sm'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
            }
          >
            🗄️ Arşiv
          </Link>
          <Link
            href="/alis-faturalar?gorunum=tumu"
            className={
              gorunum === 'tumu'
                ? 'bg-slate-600 text-white px-3 py-1.5 rounded text-sm'
                : 'border px-3 py-1.5 rounded text-sm hover:bg-slate-50'
            }
          >
            Tümü
          </Link>
        </div>

        {/* Sağ: Excel + Yeni */}
        <div className="flex items-center gap-2">
          <ExcelIndirButton action={alisFaturalariExcelAction}>
            📊 Excel İndir
          </ExcelIndirButton>
          <Link
            href="/alis-faturalar/yeni"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            + Yeni Alış Faturası
          </Link>
        </div>
      </div>

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
          <div className="text-xs text-gray-500">Toplam Miktar</div>
          <div className="text-xl font-bold">{String(ozet.toplam_miktar)}</div>
        </div>
      </div>

      <AlisFaturaList faturalar={faturalar} />
    </div>
  );
}