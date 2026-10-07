'use client';

export default function YazdirButonu() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      🖨️ Yazdır / PDF Olarak Kaydet
    </button>
  );
}
