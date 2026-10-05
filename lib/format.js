// Türk Lirası formatı: 1.234.567,89
export function paraFormat(deger) {
    const sayi = Number(deger);
    if (Number.isNaN(sayi)) return '0,00';
    return sayi.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Sayı formatı (adet, miktar için — ondalıksız)
export function sayiFormat(deger) {
    const sayi = Number(deger);
    if (Number.isNaN(sayi)) return '0';
    return sayi.toLocaleString('tr-TR');
}