// Excel yardımcı — server action'lardan çağrılır
export async function excelOlustur(satirlar, sayfaAdi = 'Sayfa1') {
  const XLSX = await import('xlsx');

  const ws = XLSX.utils.json_to_sheet(satirlar);

  // Kolon genişliklerini otomatik ayarla
  const kolonlar = Object.keys(satirlar[0] || {});
  ws['!cols'] = kolonlar.map((k) => {
    const maxUzunluk = Math.max(
      k.length,
      ...satirlar.map((s) => String(s[k] ?? '').length)
    );
    return { wch: Math.min(maxUzunluk + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sayfaAdi);

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf.toString('base64');
}

export function tarihStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${g}`;
}
