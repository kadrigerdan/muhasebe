"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStokListesiAction } from "@/actions/stokActions";
import { StokDuzenleModal } from "@/modals/StokDuzenleModal";
import { StokHareketModal } from "@/modals/StokHareketModal";
import { paraFormat } from "@/lib/format";

export function StokTablosu() {
  const router = useRouter();
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [sadeceKritik, setSadeceKritik] = useState(false);
  const [duzenlenecek, setDuzenlenecek] = useState(null);
  const [hareketUrunu, setHareketUrunu] = useState(null);
  const [depolar, setDepolar] = useState([]);

  const yukle = async () => {
    setYukleniyor(true);
    const res = await getStokListesiAction();
    if (res.success) setUrunler(res.data);
    setYukleniyor(false);
  };

  useEffect(() => {
    yukle();
  }, []);

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    return urunler
      .filter((u) => {
        const eslesme = !q || u.urun_adi?.toLocaleLowerCase("tr").includes(q);
        const kritik =
          u.tip === "hammadde" &&
          u.kritik_seviye !== null &&
          Number(u.stok) <= Number(u.kritik_seviye);
        return eslesme && (!sadeceKritik || kritik);
      })
      .sort((a, b) => {
        const aHam = a.tip === "hammadde" ? 0 : 1;
        const bHam = b.tip === "hammadde" ? 0 : 1;
        if (aHam !== bHam) return aHam - bHam;
        return String(a.urun_adi ?? "").localeCompare(String(b.urun_adi ?? ""), "tr");
      });
  }, [arama, sadeceKritik, urunler]);

  const kritikSayi = useMemo(
    () =>
      urunler.filter(
        (u) =>
          u.tip === "hammadde" &&
          u.kritik_seviye !== null &&
          Number(u.stok) <= Number(u.kritik_seviye)
      ).length,
    [urunler]
  );

  if (yukleniyor) return <p>Yükleniyor...</p>;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ürün ara..."
          className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
        />
        <label className="flex items-center gap-2 text-sm px-3 py-2 border rounded cursor-pointer">
          <input
            type="checkbox"
            checked={sadeceKritik}
            onChange={(e) => setSadeceKritik(e.target.checked)}
          />
          Sadece kritik ({kritikSayi})
        </label>
      </div>

      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="px-3 py-2 border text-left">Ürün</th>
              <th className="border py-2 ">Tip</th>
              <th className="px-3 py-2 border text-right">Alış</th>
              <th className="px-3 py-2 border text-right">Satış</th>
              <th className="px-3 py-2 border text-center">Kritik</th>
              <th className="px-3 py-2 border text-center">Stok</th>
              <th className="px-3 py-2 border text-center">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filtreli.map((u) => {
              const stokTakip = u.tip === "hammadde";
              const kritikMi = stokTakip &&
                u.kritik_seviye !== null &&
                Number(u.stok) <= Number(u.kritik_seviye);
              const tukendi =
                stokTakip &&
                u.kritik_seviye !== null &&
                Number(u.stok) <= 0;

              return (
                <tr
                  key={String(u.id)}
                  className={tukendi ? "bg-red-50" : kritikMi ? "bg-yellow-50" : ""}
                >
                  <td className="px-3 py-2 border">{String(u.id)}</td>
                  <td className="px-3 py-2 border">{u.urun_adi}</td>
                  <td className="border p-1 md:p-2 text-xs md:text-sm text-center">
                    {u.tip === "hammadde" && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        Ham Madde
                      </span>
                    )}
                    {u.tip === "satis_urunu" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Satış Ürünü
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 border text-right">
                    {paraFormat(u.varsayilan_alis_fiyati)} ₺
                  </td>
                  <td className="px-3 py-2 border text-right">
                    {paraFormat(u.varsayilan_satis_fiyati)} ₺
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {String(u.kritik_seviye)}
                  </td>
                  <td className="px-3 py-2 border text-center font-semibold">
                    {u.depolar && u.depolar.length > 0 ? (
                      <div className="space-y-0.5">
                        {u.depolar.map((d, i) => (
                          <div key={i} className="text-xs wrap-break-word">
                            <span className="text-gray-600">{d.depo}:</span>{" "}
                            <span className="font-medium text-gray-900">
                              {Number(d.stok ?? 0).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border text-center space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setDuzenlenecek(u)}
                      className="text-blue-600 hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => setHareketUrunu(u)}
                      className="text-green-600 hover:underline"
                    >
                      Stok
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtreli.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StokDuzenleModal
        urun={duzenlenecek}
        isOpen={duzenlenecek !== null}
        onClose={() => setDuzenlenecek(null)}
        kaydedildi={() => {
          setDuzenlenecek(null);
          yukle();
          router.refresh();
        }}
      />

      <StokHareketModal
        urun={hareketUrunu}
        isOpen={hareketUrunu !== null}
        depolar={depolar}
        onClose={() => setHareketUrunu(null)}
        kaydedildi={() => {
          yukle();
          router.refresh();
        }}
      />
    </>
  );
}