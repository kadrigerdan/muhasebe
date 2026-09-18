// app/fatura-kes/page.jsx
import { FaturaForm } from "@/components/FaturaForm";
import { getAktifUrunler } from "@/models/urunModel";
import { getMusteriler } from "@/models/musterilerModel";
import Link from "next/link";

export default async function FaturaKesPage() {
    const urunler = await getAktifUrunler();
    const musteriler = await getMusteriler();
    return (
        <div className="">
            <nav className="flex mt-4 px-3 justify-center">
                <Link href="/" className="py-2.5 px-4 hover:bg-slate-300 transition">🏠 Ana Sayfa</Link>
                <Link href="/fatura-kes" className="py-2.5 px-4 hover:bg-slate-300 transition">📄 Fatura Kes</Link>
            </nav>
            <h1 className="hover:bg-slate-300 transition">Fatura Kes</h1>

            {/* Formu ve ürün ekleme modalını göster */}
            <FaturaForm urunler={urunler} musteriler={musteriler} />
        </div>
    );
}