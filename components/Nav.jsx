"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  const linkler = [
    { href: "/", label: "🏠 Ana Sayfa" },
    { href: "/stok", label: "📦 Stok" },
    { href: "/fatura-kes", label: "📄 Fatura Kes" },
  ];

  return (
    <nav className="sticky top-0 z-40 flex justify-center gap-1 py-1 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      {linkler.map((l) => {
        const aktif = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`py-2.5 px-4 rounded transition ${aktif ? "bg-blue-600 text-white" : "hover:bg-slate-300"
              }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}