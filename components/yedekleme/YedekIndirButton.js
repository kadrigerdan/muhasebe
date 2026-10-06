'use client';

import { useState, useTransition } from 'react';
import { yedekIcerikAction } from '@/actions/yedeklemeActions';

export default function YedekIndirButton({ dosya }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleIndir() {
    setError(null);
    startTransition(async () => {
      const res = await yedekIcerikAction(dosya);
      if (res?.error) {
        setError(res.error);
        return;
      }

      const binary = atob(res.icerik);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const mime = dosya.endsWith('.tar.gz')
        ? 'application/gzip'
        : 'application/sql';

      const blob = new Blob([bytes], { type: mime });
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
        onClick={handleIndir}
        disabled={pending}
        className="text-blue-600 hover:underline disabled:opacity-50 text-sm"
      >
        {pending ? 'İndiriliyor...' : 'İndir'}
      </button>
      {error && <span className="text-red-500 ml-2 text-xs">{error}</span>}
    </>
  );
}
