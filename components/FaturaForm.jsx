"use client";
import { useRef, useState, useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";


export function FaturaForm({ urunler, musteriler }) {
  const router = useRouter();
  const sayacRef = useRef(1);
  const formRef = useRef(null);
  const isConfirmedRef = useRef(false); // Modal onay kontrolü için bayrak

  const [musteriId, setMusteriId] = useState("");
  const [urunListesi, setUrunListesi] = useState([]);
  const [state, formAction, isPending] = useActionState(faturaKes, null);
  const [tarih, setTarih] = useState(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
  );

  const [onayModalAcik, setOnayModalAcik] = useState(false);
  const [urunModalAcik, setUrunModalAcik] = useState(false);
  const [hedefSatirId, setHedefSatirId] = useState(null);




  // Yeni ürün ı ekle
  const urunEkle = () => {
    const yeniId = sayacRef.current++;
    setUrunListesi((prev) => [
      ...prev, {
        id: yeniId, urun_id: "", adet: 1, varsayilan_alis_fiyati: 0,
        varsayilan_satis_fiyati: 0, birimFiyat: 0
      },
    ]);
  };

  // Ürün ı sil
  const urunSil = (id) => {
    setUrunListesi(urunListesi.filter((u) => u.id !== id));
  };

  // Ürün ı güncelle
  const urunGuncelle = (id, field, value) => {
    setUrunListesi(
      urunListesi.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  // Ürün seçildiğinde fiyatı otomatik doldur
  const urunSecildi = (id, urunId) => {
    // "Yeni Ürün" seçildiyse modalı aç, fiyat güncelleme yapma
    if (urunId === "__yeni_urun__") {
      setUrunListesi((prev) =>
        prev.map((u) => u.id === id ? { ...u, urun_id: "__yeni_urun__" } : u))
      setHedefSatirId(id);
      setUrunModalAcik(true);
      return;
    }

    // Normal ürün seçimi 
    const secilen = urunler?.find((u) => u.id == Number(urunId));
    setUrunListesi((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
            ...u,
            urun_id: Number(urunId) || null,
            varsayilan_alis_fiyati: Number(secilen?.varsayilan_alis_fiyati) || 0,
            varsayilan_satis_fiyati: Number(secilen?.varsayilan_satis_fiyati) || 0,
            birimFiyat: Number(secilen?.varsayilan_satis_fiyati) || u.birimFiyat,
          }
          : u
      )
    );
  };

  // Form submit kontrolü
  const handleSubmit = (e) => {
    // Eğer modaldan onay gelmediyse formu durdur ve onay modalını aç
    if (!isConfirmedRef.current) {
      e.preventDefault();
      if (!musteriId || urunListesi.length === 0) return;
      setOnayModalAcik(true);
    }
  };

  // Modal "Onayla ve Kes" butonuna basıldığında
  const handleOnayla = () => {
    isConfirmedRef.current = true; // Bayrağı true yap ki handleSubmit engellemesin
    setOnayModalAcik(false);

    setTimeout(() => {
      formRef.current?.requestSubmit(); // Gerçek Server Action gönderimi
      isConfirmedRef.current = false; // İşlem sonrası bayrağı sıfırla
    }, 50);
  };

  // Başarılı olunca formu sıfırla
  useEffect(() => {
    if (state?.success) {
      setUrunListesi([]);
      setMusteriId("");
      setOnayModalAcik(false);
      sayacRef.current = 1;
      router.refresh();
      setTarih(
        new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0]
      );
    }
  }, [state]);

  const siraliUrunler = useMemo(() => {
    return [...(urunler ?? [])].sort((a, b) =>
      (a.urun_adi ?? "").localeCompare(b.urun_adi ?? "", "tr", {
        sensitivity: "base",
      })
    );
  }, [urunler]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Hata mesajı */}
        {state?.error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {state.error}
          </div>
        )}

        {/* Müşteri Seçimi */}
        <select
          name="musteri_id"
          required
          value={musteriId}
          onChange={(e) => setMusteriId(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
        >
          <option value="">Müşteri seç...</option>
          {musteriler?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}-{m.unvan} — {m.telefon} — {m.adres}
            </option>
          ))}
        </select>

        {/* Tarih */}
        <div>
          <label className="block text-sm font-medium">Tarih</label>
          <input
            name="tarih"
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Ürün Listesi */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Ürünler</h3>
            <button
              type="button"
              onClick={urunEkle}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Satır Ekle
            </button>
          </div>

          {urunListesi.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-5 gap-2 mb-2 p-2 border rounded"
            >
              <select
                required
                name={`urunler[${index}].urun_id`}
                value={item.urun_id || ""}
                onChange={(e) => urunSecildi(item.id, e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Ürün seç...</option>
                {urunler?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id} - {u.urun_adi} — {u.varsayilan_alis_fiyati} &mdash; {u.varsayilan_satis_fiyati}
                  </option>
                ))}
                <option value="__yeni_urun__" className="font-medium text-blue-600"> Yeni Ürün</option>
              </select>

              <input
                type="number"
                value={item.adet}
                onChange={(e) =>
                  urunGuncelle(item.id, "adet", Number(e.target.value))
                }
                placeholder="Adet"
                className="border rounded px-2 py-1"
              />

              <input
                type="number"
                step="1.00"
                value={item.varsayilan_alis_fiyati ?? 0}
                onChange={(e) =>
                  urunGuncelle(
                    item.id,
                    "varsayilan_alis_fiyati",
                    Number(e.target.value)
                  )
                }
                placeholder="Satış Fiyatı"
                className="border rounded px-2 py-1"
              />

              <input
                type="number"
                step="1.00"
                value={item.birimFiyat}
                onChange={(e) =>
                  urunGuncelle(item.id, "birimFiyat", Number(e.target.value))
                }
                placeholder="Birim fiyat"
                className="border rounded px-2 py-1"
              />

              <button
                type="button"
                onClick={() => urunSil(item.id)}
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Hidden Input: Tüm Ürün Verisi */}
          <input
            type="hidden"
            name="urunler"
            value={JSON.stringify(
              urunListesi
                .filter((u) => u.urun_id)
                .map((u) => ({
                  urun_id: Number(u.urun_id),
                  adet: Number(u.adet) || 1,
                  birimFiyat: Number(u.birimFiyat) || 0,
                }))
            )}
          />

          {/* FORM ALTI BUTON ALANI (1/3 SOL - 2/3 SAĞ) */}
          <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* SOL (1/3): Yeni Ürün Modal Butonu */}


            {/* SAĞ (2/3): Fatura Kes Butonu */}
            <button
              type="submit"
              disabled={isPending || urunListesi.length === 0}
              className="col-span-3 w-full bg-green-900 text-white px-4 py-3 rounded hover:bg-green-950 font-medium transition"
            >
              {isPending ? "iliyor..." : "Fatura Kes"}
            </button>
          </div>
        </div>
      </form>



      <UrunEkleModal
        isOpen={urunModalAcik}
        onClose={() => {
          setUrunModalAcik(false);
          setHedefSatirId(null);
          // "Yeni Ürün" seçili kaldıysa select'i temizle
          if (hedefSatirId != null) {
            setUrunListesi((prev) =>
              prev.map((u) =>
                u.id === hedefSatirId && u.urun_id === "__yeni_urun__"
                  ? { ...u, urun_id: "" }
                  : u
              )
            );
          }
        }}
        yeniUrunEklendi={(yeniUrun) => {
          if (hedefSatirId != null && yeniUrun) {
            setUrunListesi((prev) =>
              prev.map((u) =>
                u.id === hedefSatirId
                  ? {
                    ...u,
                    urun_id: yeniUrun.id,
                    varsayilan_alis_fiyati: Number(yeniUrun.varsayilan_alis_fiyati) || 0,
                    varsayilan_satis_fiyati: Number(yeniUrun.varsayilan_satis_fiyati) || 0,
                    birimFiyat:
                      Number(yeniUrun.varsayilan_satis_fiyati) || u.birimFiyat,
                  }
                  : u
              )
            );
          }
          setHedefSatirId(null);
          setUrunModalAcik(false);
          router.refresh();
        }}
      />


      {/* ONAY MODALI */}
      <FaturaKesModal
        isOpen={onayModalAcik}
        onClose={() => setOnayModalAcik(false)}
        onConfirm={handleOnayla}
        isPending={isPending}
        musteri={
          musteriler?.find((m) => String(m.id) === String(musteriId))?.unvan
        }
        tarih={tarih}
        urunListesi={urunListesi}
        urunler={urunler}
      />
    </>
  );
}