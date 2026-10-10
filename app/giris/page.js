import { ayarlariGetir } from '@/models/ayarlarModel';
import GirisForm from '@/components/auth/GirisForm';

export const dynamic = 'force-dynamic';

export default async function GirisPage({ searchParams }) {
  const sp = await searchParams;
  const donus = sp?.donus || '/';

  const ayarlar = await ayarlariGetir();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8">
        {/* Logo / Başlık */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold">
            {ayarlar.sirket_adi || 'Muhasebe'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sisteme giriş yapın
          </p>
        </div>

        <GirisForm donus={donus} />

        <div className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} {ayarlar.sirket_adi || 'Muhasebe'}
        </div>
      </div>
    </div>
  );
}
