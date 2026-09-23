import { StokTablosu } from "@/components/StokTablosu";
import Link from "next/link";

export const metadata = { title: "Stok" };

export default function StokPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stok Takibi</h1>

      </div>
      <StokTablosu />
    </div>
  );
}