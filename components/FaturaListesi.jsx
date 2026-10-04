// app/components/FaturaListesi.jsx
"use client";

import { useState, useEffect } from "react";


export function FaturaListesi() {
  const [faturalar, setFaturalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // 📌 Action ile veri çek
  const verileriYukle = async () => {
    setYukleniyor(true);
    const result = await getFaturalarAction();
    if (result.success) setFaturalar(result.data);
    setYukleniyor(false);
  };

  useEffect(() => {
    verileriYukle();
  }, []);

  const handleSil = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    const result = await faturaSilAction(id);
    if (result.success) verileriYukle();
  };

  if (yukleniyor) return <p>Yükleniyor...</p>;

  return (
    <div>
      <button onClick={verileriYukle} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        🔄 Yenile
      </button>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">No</th>
            <th className="px-4 py-2 border">Müşteri</th>
            <th className="px-4 py-2 border">Tarih</th>
            <th className="px-4 py-2 border">Toplam</th>
            <th className="px-4 py-2 border">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {faturalar.map((f) => (
            <tr key={f.id}>
              <td className="px-4 py-2 border text-center">#{f.id}</td>
              <td className="px-4 py-2 border">{f.musteri}</td>
              <td className="px-4 py-2 border">{f.tarih}</td>
              <td className="px-4 py-2 border text-right">
                {Number(f.toplam_tutar).toFixed(2)} ₺
              </td>
              <td className="px-4 py-2 border text-center">
                <a href={`/faturalar/${f.id}`} className="text-blue-500 mr-2">Detay</a>
                <button onClick={() => handleSil(f.id)} className="text-red-500">Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}