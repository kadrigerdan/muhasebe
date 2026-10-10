'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const linkler = [
  { href: '/', label: '🏠 Ana Sayfa' },
  { href: '/cariler', label: '📦 Cariler' },
  { href: '/urunler', label: '🔧 Ürünler' },
  { href: '/alis-faturalar', label: '⬇️ Alış' },
  { href: '/satis-faturalar', label: '⬆️ Satış' },
  { href: '/stok', label: '📦 Stok' },
  { href: '/personel', label: '👤 Personel' },
  { href: '/kasa', label: '💰 Kasa' },
  { href: '/restoran', label: '🍽️ Restoran' },
  { href: '/mutfak', label: '🍳 Mutfak' },
  { href: '/yedekleme', label: '💾 Yedekleme' },
  { href: '/ayarlar', label: '⚙️ Ayarlar' },
];

export default function Nav({ kullanici }) {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="flex items-center justify-between px-3 py-1">
        {/* Menü Linkleri */}
        <div className="flex flex-wrap justify-center gap-1 flex-1">
          {linkler.map((l) => {
            const aktif = l.href === '/' ? path === '/' : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`py-2 px-3 rounded text-sm transition ${
                  aktif ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Kullanıcı Bilgisi */}
        {kullanici && (
          <div className="flex items-center gap-2 ml-3 border-l pl-3">
            <div className="text-xs text-right leading-tight hidden sm:block">
              <div className="font-medium">{kullanici.ad_soyad}</div>
              <div className="text-gray-500">
                {kullanici.rol === 'admin' ? 'Yönetici' : 'Personel'}
              </div>
            </div>
            <form action="/cikis" method="GET">
              <button
                type="submit"
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm"
                title="Çıkış Yap"
              >
                🚪
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
