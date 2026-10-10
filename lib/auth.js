import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'degistir-bu-anahtari-uretimde'
);

const COOKIE_ADI = 'oturum';
const SURE = '7d';

export async function tokenOlustur(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SURE)
    .sign(SECRET);
}

export async function tokenDogrula(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Server Component / Action için: cookie'den oturum oku
export async function oturumAl() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ADI)?.value;
  if (!token) return null;
  return await tokenDogrula(token);
}

// Login başarılıysa çağır
export async function oturumKaydet(payload) {
  const token = await tokenOlustur(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_ADI, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

// Logout
export async function oturumSil() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ADI);
}
