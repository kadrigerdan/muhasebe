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
    return urunler.filter((u) => {
      const eslesme = !q || u.urun_adi?.toLocaleLowerCase("tr").includes(q);
      const kritik = Number(u.stok) <= Number(u.kritik_seviye ?? 0);
      return eslesme && (!sadeceKritik || kritik);
    });
  }, [arama, sadeceKritik, urunler]);


  const kritikSayi = useMemo(
    () => urunler.filter((u) => Number(u.stok) <= Number(u.kritik_seviye ?? 0)).length,
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
              <th className="px-3 py-2 border text-left">Ürün</th>
              <th className="px-3 py-2 border text-right">Alış</th>
              <th className="px-3 py-2 border text-right">Satış</th>
              <th className="px-3 py-2 border text-center">Kritik</th>
              <th className="px-3 py-2 border text-center">Stok</th>
              <th className="px-3 py-2 border text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtreli.map((u) => {
              const kritik = Number(u.stok) <= Number(u.kritik_seviye ?? 0);
              return (
                <tr
                  key={u.id}
                  className={kritik ? "bg-red-50 dark:bg-red-900/20" : ""}
                >
                  <td className="px-3 py-2 border">{u.urun_adi}</td>
                  <td className="px-3 py-2 border text-right">
                    {paraFormat(u.varsayilan_alis_fiyati)} ₺
                  </td>
                  <td className="px-3 py-2 border text-right">
                    {paraFormat(u.varsayilan_satis_fiyati)} ₺
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {u.kritik_seviye ?? 0}
                  </td>
                  <td className="px-3 py-2 border text-center font-semibold">
                    {u.stok}
                    {kritik && (
                      <span className="ml-2 text-xs text-red-600">kritik</span>
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
                <td colSpan={6} className="p-6 text-center text-gray-500">
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
        onClose={() => setHareketUrunu(null)}
        kaydedildi={() => {
          yukle();
          router.refresh();
        }}
      />
    </>
  );
}