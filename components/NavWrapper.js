'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';

// Nav'ın gizleneceği sayfalar
const GIZLI_SAYFALAR = ['/restoran', '/mutfak'];

export default function NavWrapper({ kullanici }) {
  const path = usePathname();

  const gizle = GIZLI_SAYFALAR.some((p) => path.startsWith(p));
  if (gizle) return null;

  return <Nav kullanici={kullanici} />;
}
