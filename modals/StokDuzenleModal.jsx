"use client";
import { urunGuncelleAction, urunPasifeAlAction } from "@/actions/urunGuncelleActions";
import { useEffect, useState, useActionState } from "react";
import { createPortal } from "react-dom";


export function StokDuzenleModal({ urun, isOpen, onClose, kaydedildi }) {
    const [mounted, setMounted] = useState(false);
    const [state, formAction, isPending] = useActionState(urunGuncelleAction, {
        success: false,
    });
    const [pasifState, pasifAction, pasifPending] = useActionState(
        urunPasifeAlAction, { success: false });

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (state?.success || pasifState?.success) {
            kaydedildi?.();
            onClose?.();
        }
    }, [state, pasifState, kaydedildi, onClose]);

    if (!mounted || !isOpen || !urun) return null;

    const hata =
        (state?.message && !state?.success && state.message) ||
        (pasifState?.message && !pasifState?.success && pasifState.message);

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    Ürünü Düzenle
                </h2>

                {hata && (
                    <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                        {hata}
                    </div>
                )}

                <form action={formAction} className="space-y-3">
                    <input type="hidden" name="id" value={urun.id} />

                    <div>
                        <label className="block text-xs font-medium mb-1">Ürün Adı *</label>
                        <input
                            name="urun_adi"
                            required
                            defaultValue={urun.urun_adi}
                            className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Alış Fiyatı (₺)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="varsayilan_alis_fiyati"
                                defaultValue={urun.varsayilan_alis_fiyati}
                                className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Satış Fiyatı (₺)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="varsayilan_satis_fiyati"
                                defaultValue={urun.varsayilan_satis_fiyati}
                                className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Kritik Seviye
                        </label>
                        <input
                            type="number"
                            name="kritik_seviye"
                            defaultValue={urun.kritik_seviye ?? 10}
                            className="w-full border p-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Stok bu değerin altına düşünce listede kırmızı görünür.
                        </p>
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-2">
                        <button
                            type="button"
                            disabled={pasifPending}
                            onClick={(e) => {
                                if (
                                    !confirm(
                                        `"${urun.urun_adi}" pasife alınacak. Fatura listelerinde görünmeyecek. Onaylıyor musunuz?`
                                    )
                                )
                                    return;
                                const fd = new FormData();
                                fd.append("id", urun.id);
                                pasifAction(fd);
                            }}
                            className="text-red-600 text-sm hover:underline"
                        >
                            Pasife Al
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                                {isPending ? "Kaydediliyor..." : "Güncelle"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}