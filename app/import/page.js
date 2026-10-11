'use client';

import { useState } from 'react';
import ExcelImport from '@/components/import/ExcelImport';
import {
  urunSablonAction,
  urunImportAction,
  cariSablonAction,
  cariImportAction,
} from '@/actions/importActions';

export default function ImportPage() {
  const [sekme, setSekme] = useState('urun');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📤 Excel'den Veri Yükle</h1>

      {/* Sekmeler */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSekme('urun')}
          className={`px-4 py-2 font-medium ${
            sekme === 'urun'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔧 Ürünler
        </button>
        <button
          onClick={() => setSekme('cari')}
          className={`px-4 py-2 font-medium ${
            sekme === 'cari'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          👥 Cariler
        </button>
      </div>

      {sekme === 'urun' && (
        <ExcelImport
          baslik="Ürünler"
          sablonAction={urunSablonAction}
          importAction={urunImportAction}
        />
      )}

      {sekme === 'cari' && (
        <ExcelImport
          baslik="Cariler"
          sablonAction={cariSablonAction}
          importAction={cariImportAction}
        />
      )}

      {/* Bilgi Notu */}
      <div className="border rounded-lg p-4 bg-gray-50 text-xs text-gray-600 space-y-1">
        <div className="font-semibold">📌 Kurallar</div>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Aynı isimde kayıt varsa <b>atlanır</b>, diğerleri eklenir.</li>
          <li>Tip değerleri: <code>hammadde</code>, <code>satis_urunu</code> (ürün) veya <code>tedarikci</code>, <code>musteri</code>, <code>her_ikisi</code> (cari).</li>
          <li>İlk satır <b>başlık</b> olmalı (şablondaki gibi).</li>
          <li>Fiyatlar nokta veya virgül ile yazılabilir.</li>
        </ul>
      </div>
    </div>
  );
}
