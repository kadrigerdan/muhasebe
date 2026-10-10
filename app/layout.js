import './globals.css';
import Nav from '@/components/Nav';
import { oturumAl } from '@/lib/auth';

export const metadata = {
  title: 'Muhasebe',
  description: 'Muhasebe yönetim sistemi',
};

export default async function RootLayout({ children }) {
  const oturum = await oturumAl();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-gray-50 min-h-screen">
        {oturum && <Nav kullanici={oturum} />}
        <main>{children}</main>
      </body>
    </html>
  );
}
