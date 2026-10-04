// app/components/FaturaDetay.jsx
"use client";
import { useState, useEffect } from "react";


export function FaturaDetay({ id }) {
  const [fatura, setFatura] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const yukle = async () => {
      const result = await getFaturaAction(id);
      if (result.success) setFatura(result.data);
      setYukleniyor(false);
    };
    yukle();
  }, [id]);

  if (yukleniyor) return <p>Yükleniyor...</p>;
  if (!fatura) return <p>Fatura bulunamadı</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Müşteri</p>
          <p className="font-semibold">{fatura.musteri}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tarih</p>
          <p className="font-semibold">{fatura.tarih}</p>
        </div>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Ürün</th>
            <th className="px-4 py-2 border">Dolu</th>
            <th className="px-4 py-2 border">Boş</th>
            <th className="px-4 py-2 border">Fiyat</th>
            <th className="px-4 py-2 border">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {fatura.detaylar.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-2 border">{d.cinsi}</td>
              <td className="px-4 py-2 border text-center">{d.dolu_adet}</td>
              <td className="px-4 py-2 border text-center">{d.bos_adet}</td>
              <td className="px-4 py-2 border text-right">{d.birim_fiyat} ₺</td>
              <td className="px-4 py-2 border text-right">{(d.dolu_adet * d.birim_fiyat).toFixed(2)} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}