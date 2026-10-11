import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'degistir-bu-anahtari-uretimde'
);

const COOKIE_ADI = 'oturum';
const ACIK_SAYFALAR = ['/giris', '/cikis'];

// Personel sadece bu sayfalara erişebilir
const PERSONEL_SAYFALAR = ['/', '/restoran', '/mutfak', '/profil'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const acikMi = ACIK_SAYFALAR.some((p) => pathname.startsWith(p));

  const token = request.cookies.get(COOKIE_ADI)?.value;

  let oturum = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      oturum = payload;
    } catch {
      oturum = null;
    }
  }

  // Giriş yapılmamış + korumalı sayfa
  if (!oturum && !acikMi) {
    const url = request.nextUrl.clone();
    url.pathname = '/giris';
    url.searchParams.set('donus', pathname);
    return NextResponse.redirect(url);
  }

  // Giriş yapılmış + /giris → ana sayfaya
  if (oturum && pathname === '/giris') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Personel yetki kontrolü
  if (oturum && oturum.rol === 'personel') {
    const izinliMi = PERSONEL_SAYFALAR.some(
      (p) => pathname === p || (p !== '/' && pathname.startsWith(p))
    );
    if (!izinliMi) {
      const url = request.nextUrl.clone();
      url.pathname = '/restoran';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
