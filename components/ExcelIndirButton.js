'use client';

import { useState, useTransition } from 'react';

export default function ExcelIndirButton({
  action,
  children = '📊 Excel',
  className = '',
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState(null);

  function handleClick() {
    setHata(null);
    startTransition(async () => {
      const res = await action();
      if (res?.error) {
        setHata(res.error);
        return;
      }

      // base64 → blob → indir
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

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        className={
          className ||
          'bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm'
        }
      >
        {pending ? 'Hazırlanıyor...' : children}
      </button>
      {hata && <span className="text-red-500 text-xs ml-2">{hata}</span>}
    </>
  );
}
