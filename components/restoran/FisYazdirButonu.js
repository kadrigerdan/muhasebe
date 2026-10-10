'use client';

export default function FisYazdirButonu() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium"
    >
      🖨️ Fiş Yazdır (80mm)
    </button>
  );
}
