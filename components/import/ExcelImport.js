'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function ExcelImport({
  baslik,
  sablonAction,
  importAction,
}) {
  const router = useRouter();
  const [veriler, setVeriler] = useState(null);
  const [dosyaAdi, setDosyaAdi] = useState('');
  const [hata, setHata] = useState(null);
  const [sonuc, setSonuc] = useState(null);
  const [pending, startTransition] = useTransition();
  const [sablonPending, startSablon] = useTransition();

  function sablonIndir() {
    startSablon(async () => {
      const res = await sablonAction();
      if (res?.error) {
        setHata(res.error);
        return;
      }
      const binary = atob(res.icerik);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.dosya;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  async function dosyaSec(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHata(null);
    setSonuc(null);
    setDosyaAdi(file.name);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);

      if (!json.length) {
        setHata('Excel boş veya okunamadı.');
        return;
      }

      setVeriler(json);
    } catch (err) {
      console.error(err);
      setHata('Dosya okunamadı. Geçerli bir Excel dosyası seçin.');
    }
  }

  function yukle() {
    if (!veriler?.length) return;
    setHata(null);
    setSonuc(null);
    startTransition(async () => {
      // JSON string olarak gönder (Server Action düz obje bekler)
      const jsonStr = JSON.stringify(veriler);
      const res = await importAction(jsonStr);
      if (res?.error) {
        setHata(res.error);
        return;
      }
      setSonuc(res);
      setVeriler(null);
      setDosyaAdi('');
      router.refresh();
    });
  }

  // Önizleme kolonları
  const kolonlar = veriler?.length ? Object.keys(veriler[0]) : [];

  return (
    <div className="space-y-6">
      {/* Şablon İndir */}
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-bold text-blue-800">1. Adım — Şablon İndir</div>
            <div className="text-sm text-blue-600 mt-1">
              Boş şablonu indirin, doldurun, sonra yükleyin.
            </div>
          </div>
          <button
            onClick={sablonIndir}
            disabled={sablonPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {sablonPending ? 'Hazırlanıyor...' : '📥 Şablon İndir'}
          </button>
        </div>
      </div>

      {/* Dosya Seç */}
      <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
        <div className="font-bold text-green-800 mb-2">
          2. Adım — Excel Dosyasını Seç
        </div>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={dosyaSec}
          className="block w-full text-sm border rounded px-3 py-2 bg-white"
        />
        {dosyaAdi && (
          <div className="text-xs text-green-700 mt-2">
            📎 {dosyaAdi} — {veriler?.length || 0} satır
          </div>
        )}
      </div>

      {/* Hata */}
      {hata && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{hata}</div>
      )}

      {/* Sonuç */}
      {sonuc && (
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
          <div className="font-bold text-green-800">
            ✓ {sonuc.eklenen} kayıt eklendi
          </div>
          {sonuc.hata > 0 && (
            <>
              <div className="text-sm text-orange-700 mt-2">
                ⚠️ {sonuc.hata} kayıt eklenemedi:
              </div>
              <ul className="text-xs text-orange-700 mt-1 list-disc list-inside max-h-40 overflow-auto">
                {sonuc.hatalar.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Önizleme */}
      {veriler?.length > 0 && (
        <div className="space-y-3">
          <div className="font-bold">3. Adım — Önizleme ({veriler.length} satır)</div>
          <div className="overflow-auto max-h-96 border rounded">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {kolonlar.map((k) => (
                    <th key={k} className="border p-2 text-left whitespace-nowrap">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {veriler.slice(0, 100).map((satir, i) => (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                    {kolonlar.map((k) => (
                      <td key={k} className="border p-2 whitespace-nowrap">
                        {String(satir[k] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {veriler.length > 100 && (
            <div className="text-xs text-gray-500">
              (İlk 100 satır gösteriliyor, toplam {veriler.length})
            </div>
          )}

          <button
            onClick={yukle}
            disabled={pending}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {pending
              ? 'Yükleniyor...'
              : `✓ ${veriler.length} Kaydı Yükle`}
          </button>
        </div>
      )}
    </div>
  );
}
