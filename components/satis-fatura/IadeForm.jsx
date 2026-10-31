'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { satisIadeFaturaAction } from '@/actions/satisFaturaActions';
import { paraFormat } from '@/lib/format';

export default function IadeForm({ kaynakFaturaId, kalemler, varsayilanTarih }) {
	const router = useRouter();
	const [tarih, setTarih] = useState(varsayilanTarih);
	const [hata, setHata] = useState(null);
	const [pending, setPending] = useState(false);

	const [secimler, setSecimler] = useState(() =>
		kalemler.reduce((acc, k) => {
			acc[k.urun_id] = { secili: false, adet: 0 };
			return acc;
		}, {})
	);

	const toggle = (urun_id) => {
		const k = kalemler.find((x) => Number(x.urun_id) === Number(urun_id));
		const kalan = Number(k.iade_edilebilir);
		setSecimler((s) => ({
			...s,
			[urun_id]: s[urun_id].secili
				? { secili: false, adet: 0 }
				: { secili: true, adet: kalan },
		}));
	};

	const setAdet = (urun_id, deger) => {
		const k = kalemler.find((x) => Number(x.urun_id) === Number(urun_id));
		const kalan = Number(k.iade_edilebilir);
		let v = Number(deger);
		if (!Number.isFinite(v) || v < 0) v = 0;
		if (v > kalan) v = kalan;
		setSecimler((s) => ({ ...s, [urun_id]: { secili: v > 0, adet: v } }));
	};

	const toplam = kalemler.reduce((sum, k) => {
		const s = secimler[k.urun_id];
		if (!s?.secili) return sum;
		return sum + s.adet * Number(k.birim_fiyat);
	}, 0);

	const onSubmit = async (e) => {
		e.preventDefault();
		setHata(null);

		const seciliKalemler = kalemler.filter((k) =>
			secimler[k.urun_id]?.secili && secimler[k.urun_id].adet > 0)
			.map((k) => ({
				urun_id: Number(k.urun_id),
				adet: Number(secimler[k.urun_id].adet),
				birim_fiyat: Number(k.birim_fiyat),
			}));

		if (!seciliKalemler.length) {
			setHata('En az bir kalem seçin.');
			return;
		}

		setPending(true);
		try {
			const fd = new FormData();
			fd.set('kaynak_fatura_id', String(kaynakFaturaId));
			fd.set('tarih', tarih);
			fd.set('kalemler', JSON.stringify(seciliKalemler));

			const res = await satisIadeFaturaAction({}, fd);
			if (res?.error) {
				setHata(res.error);
				setPending(false);
				return;
			}
			router.push(`/satis-faturalar/${res.iadeFaturaId}`);
		} catch (err) {
			setHata(err.message || 'Bir hata oluştu.');
			setPending(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="flex items-center gap-3">
				<label className="text-sm font-medium">İade Tarihi</label>
				<input
					type="date"
					value={tarih}
					onChange={(e) => setTarih(e.target.value)}
					className="border rounded px-3 py-1.5 text-sm"
					required
				/>
			</div>

			{hata && (
				<div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
					{hata}
				</div>
			)}

			<table className="w-full border-collapse border text-sm">
				<thead className="bg-gray-100">
					<tr>
						<th className="border p-2 w-10"></th>
						<th className="border p-2 text-left">Ürün</th>
						<th className="border p-2 text-right">Orijinal</th>
						<th className="border p-2 text-right">İade Edilen</th>
						<th className="border p-2 text-right">Kalan</th>
						<th className="border p-2 text-right">Birim Fiyat</th>
						<th className="border p-2 text-right">İade Adet</th>
						<th className="border p-2 text-right">Satır Toplam</th>
					</tr>
				</thead>
				<tbody>
					{kalemler.map((k) => {
						const s = secimler[k.urun_id] || { secili: false, adet: 0 };
						const satir = s.secili ? s.adet * Number(k.birim_fiyat) : 0;
						const kalan = Number(k.iade_edilebilir);
						return (
							<tr key={String(k.urun_id)} className={kalan <= 0 ? 'text-gray-400' : ''}>
								<td className="border p-2 text-center">
									<input
										type="checkbox"
										checked={s.secili}
										disabled={kalan <= 0}
										onChange={() => toggle(k.urun_id)}
									/>
								</td>
								<td className="border p-2">{k.urun_adi}</td>
								<td className="border p-2 text-right">{String(k.orijinal_adet)}</td>
								<td className="border p-2 text-right">{String(k.iade_edilen)}</td>
								<td className="border p-2 text-right font-medium">{String(kalan)}</td>
								<td className="border p-2 text-right">{paraFormat(k.birim_fiyat)} ₺</td>
								<td className="border p-2 text-right">
									<input
										type="number"
										min="0"
										max={kalan}
										step="1"
										value={s.adet}
										disabled={!s.secili || kalan <= 0}
										onChange={(e) => setAdet(k.urun_id, e.target.value)}
										className="border rounded px-2 py-1 w-20 text-right text-sm"
									/>
								</td>
								<td className="border p-2 text-right">{paraFormat(satir)} ₺</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr className="font-bold bg-gray-50">
						<td colSpan={7} className="border p-2 text-right">İade Toplamı</td>
						<td className="border p-2 text-right">{paraFormat(toplam)} ₺</td>
					</tr>
				</tfoot>
			</table>

			<div className="flex gap-2">
				<button
					type="submit"
					disabled={pending}
					className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
				>
					{pending ? 'Kesiliyor…' : '↩️ İade Faturasını Kes'}
				</button>
				<button
					type="button"
					onClick={() => router.back()}
					className="border px-4 py-2 rounded hover:bg-slate-50"
				>
					Vazgeç
				</button>
			</div>
		</form>
	);
}