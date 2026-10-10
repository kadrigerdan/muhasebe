'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MutfakAutoRefresh({ intervalMs = 5000 }) {
  const router = useRouter();
  const [sonGuncelleme, setSonGuncelleme] = useState(null);

  useEffect(() => {
    setSonGuncelleme(new Date());
    const interval = setInterval(() => {
      router.refresh();
      setSonGuncelleme(new Date());
    }, intervalMs);
    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span suppressHydrationWarning>
          Otomatik yenileniyor ({intervalMs / 1000}s)
          {sonGuncelleme && (
            <> • {sonGuncelleme.toLocaleTimeString('tr-TR')}</>
          )}
        </span>
      </div>
      <button
        onClick={() => {
          router.refresh();
          setSonGuncelleme(new Date());
        }}
        className="border px-2 py-1 rounded hover:bg-gray-100"
      >
        🔄 Yenile
      </button>
    </div>
  );
}
