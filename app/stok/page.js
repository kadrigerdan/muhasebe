import Link from 'next/link';
import { StokTablosu } from '@/components/stok/StokTablosu';
import ExcelIndirButton from '@/components/ExcelIndirButton';
import { stokExcelAction } from '@/actions/excelActions';

export const metadata = { title: 'Stok' };

export default function StokPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Stok Takibi</h1>
        <div className="flex gap-2 items-center">
          <ExcelIndirButton action={stokExcelAction}>
            📊 Excel İndir
          </ExcelIndirButton>
          <Link href="/" className="text-blue-600 hover:underline self-center text-sm">
            ← Ana Sayfa
          </Link>
        </div>
      </div>
      <StokTablosu />
    </div>
  );
}
