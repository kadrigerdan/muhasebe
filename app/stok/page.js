import Link from 'next/link';
import { StokTablosu } from '@/components/stok/StokTablosu';
import ExcelIndirButton from '@/components/ExcelIndirButton';
import { stokExcelAction } from '@/actions/excelActions';

export const metadata = { title: 'Stok' };

export default function StokPage() {
  return (
    <div className="m-2  ">
      <div className="grid grid-cols-3 m-4 gap-4 ">
        <h1 className="text-2xl font-bold">Stok Takibi</h1>
        <ExcelIndirButton action={stokExcelAction}> 📊 Excel İndir</ExcelIndirButton>
        <Link href="/" className="text-blue-600 hover:underline self-center text-sm">
          ← Ana Sayfa
        </Link>
      </div>
      <StokTablosu />
    </div>
  );
}
