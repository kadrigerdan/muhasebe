import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>

      <nav className="flex mt-4 px-3 justify-center">
        <Link href="/" className="py-2.5 px-4 hover:bg-slate-300 transition">🏠 Ana Sayfa</Link>

        <Link href="/fatura-kes" className="py-2.5 px-4 hover:bg-slate-300 transition">📄 Fatura Kes</Link>
      </nav>
      <h1 className="">Ana Sayfa</h1>

    </div>
  );
}
