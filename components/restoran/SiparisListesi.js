'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  adisyonKalemSilAction,
  adisyonKapatAction,
  mutfagaGonderAction,
  adisyonIptalAction,
  adisyonKalemAdetAction,
} from '@/actions/adisyonActions';
import { paraFormat } from '@/lib/format';

export default function SiparisListesi({ adisyon, kasaHesaplari }) {
  const router = useRouter();
  const [silPending, startSil] = useTransition();
  const [odemeAcik, setOdemeAcik] = useState(false);
  const [kasaId, setKasaId] = useState(kasaHesaplari[0]?.id ?? '');
  const [odemeYontemi, setOdemeYontemi] = useState('nakit');
  const [kapatPending, startKapat] = useTransition();
  const [hata, setHata] = useState(null);
  const [iptalPending, startIptal] = useTransition();
  const [gonderPending, startGonder] = useTransition();
  const [basari, setBasari] = useState(null);
  const [iptalAcik, setIptalAcik] = useState(false);
  const [sebep, setSebep] = useState('musteri_iptal');
  const [adetPending, startAdet] = useTransition();

  function otomatikKasaSec(yontem) {
    const tipMap = {
      nakit: 'nakit',
      kredi_karti: 'pos',
      pos: 'pos',
      iban: 'banka',
    };
    const hedefTip = tipMap[yontem];
    const uygun = kasaHesaplari.find((k) => k.tip === hedefTip);
    if (uygun) setKasaId(uygun.id);
  }

  function kalemSil(kalemId) {
    startSil(async () => {
      const res = await adisyonKalemSilAction(kalemId, adisyon.id);
      if (res?.error) setHata(res.error);
      else router.refresh();
    });
  }

  function odemeAl() {
    setHata(null);
    startKapat(async () => {
      const formData = new FormData();
      formData.set('adisyon_id', adisyon.id);
      formData.set('kasa_id', kasaId);
      formData.set('odeme_yontemi', odemeYontemi);

      const res = await adisyonKapatAction(null, formData);
      if (res?.error) {
        setHata(res.error);
        setOdemeAcik(false);
      } else {
        router.push('/restoran');
        router.refresh();
      }
    });
  }

  function masaİptal() {
    setIptalAcik(true);
  }

  function iptalOnayla() {
    setHata(null);
    startIptal(async () => {
      const res = await adisyonIptalAction(adisyon.id, sebep);
      if (res?.error) {
        setHata(res.error);
        setIptalAcik(false);
      } else {
        if (res.fire_adet > 0) {
          alert(`İptal edildi. ${res.fire_adet} kalem fire kaydedildi.`);
        }
        router.push('/restoran');
        router.refresh();
      }
    });
  }

  function mutfagaGonder() {
    setHata(null);
    setBasari(null);
    startGonder(async () => {
      const res = await mutfagaGonderAction(adisyon.id);
      if (res?.error) setHata(res.error);
      else setBasari(`✓ ${res.gonderilen} ürün mutfağa gönderildi`);
    });
  }

  // Bekleyen kalem (satır) ve adet
  const bekleyenKalemler = adisyon.kalemler.filter(
    (k) => k.mutfak_durum === 'secildi'
  );
  const bekleyenKalemSayi = bekleyenKalemler.length;
  const bekleyenAdet = bekleyenKalemler.reduce(
    (s, k) => s + Number(k.adet),
    0
  );

  return (
    <div className="space-y-3">
      {/* Masa İptal Butonu — en üstte */}
      <div className="flex justify-end">
        <button
          onClick={masaİptal}
          disabled={iptalPending}
          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
        >
          {iptalPending ? 'İptal ediliyor...' : '🗑️ Masayı İptal Et'}
        </button>
      </div>

      {/* İptal Onay Kutusu */}
      {iptalAcik && (
        <div className="border-2 border-red-400 rounded-lg p-3 bg-red-50 space-y-2">
          <div className="text-sm font-medium text-red-800">
            ⚠️ Masa iptal edilecek. Neden?
          </div>
          <select
            value={sebep}
            onChange={(e) => setSebep(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="musteri_iptal">Müşteri vazgeçti</option>
            <option value="musteri_bekledi">Müşteri çok bekledi</option>
            <option value="siparis_hatasi">Sipariş yanlış girildi</option>
            <option value="malzeme_bitti">Malzeme bitti</option>
            <option value="diger">Diğer</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={iptalOnayla}
              disabled={iptalPending}
              className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {iptalPending ? 'İptal ediliyor...' : '🗑️ İptal Et'}
            </button>
            <button
              onClick={() => setIptalAcik(false)}
              disabled={iptalPending}
              className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 text-sm"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      <h3 className="font-semibold">Siparişler</h3>

      {hata && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{hata}</div>
      )}

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Ürün</th>
              <th className="p-2 text-center w-16">Adet</th>
              <th className="p-2 text-right w-24">Tutar</th>
              <th className="p-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {adisyon.kalemler.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Henüz sipariş yok.
                </td>
              </tr>
            )}
            {adisyon.kalemler.map((k) => (
              <tr key={String(k.id)} className="border-t">
                <td className="p-2">
                  {k.urun_adi}
                  {k.mutfak_durum === 'secildi' && (
                    <span className="ml-2 text-xs text-orange-600">🔔 bekliyor</span>
                  )}
                  {k.mutfak_durum === 'bekliyor' && (
                    <span className="ml-2 text-xs text-blue-600">🍳 mutfakta</span>
                  )}
                  {k.mutfak_durum === 'hazir' && (
                    <span className="ml-2 text-xs text-green-600">✓ hazır</span>
                  )}
                  {k.mutfak_durum === 'servis' && (
                    <span className="ml-2 text-xs text-gray-500">✓ servis edildi</span>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        startAdet(async () => {
                          const res = await adisyonKalemAdetAction(k.id, Number(k.adet) - 1);
                          if (res?.error) setHata(res.error);
                          else router.refresh();
                        });
                      }}
                      disabled={adetPending}
                      className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 font-bold"
                    >
                      −
                    </button>
                    <span className="font-bold w-6 text-center">{String(k.adet)}</span>
                    <button
                      onClick={() => {
                        startAdet(async () => {
                          const res = await adisyonKalemAdetAction(k.id, Number(k.adet) + 1);
                          if (res?.error) setHata(res.error);
                          else router.refresh();
                        });
                      }}
                      disabled={adetPending}
                      className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 font-bold"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-2 text-right font-medium">
                  {paraFormat(k.toplam)} ₺
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => kalemSil(k.id)}
                    disabled={silPending}
                    className="text-red-600 hover:underline text-xs disabled:opacity-50"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2">
            <tr>
              <td colSpan={2} className="p-3 text-right font-bold">
                Toplam:
              </td>
              <td className="p-3 text-right font-bold text-lg">
                {paraFormat(adisyon.toplam)} ₺
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Başarı mesajı */}
      {basari && (
        <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
          {basari}
        </div>
      )}

      {/* Mutfağa Gönder — sadece bekleyen varsa */}
      {bekleyenKalemSayi > 0 && (
        <div className="border-2 border-orange-400 rounded-lg p-3 bg-orange-50 space-y-2">
          <div className="text-sm text-orange-700 font-medium">
            🔔 {bekleyenKalemSayi} kalem ({bekleyenAdet} adet) mutfağa gönderilmeyi bekliyor
          </div>
          <button
            onClick={mutfagaGonder}
            disabled={gonderPending}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50"
          >
            {gonderPending
              ? 'Gönderiliyor...'
              : `🍳 Mutfağa Gönder (${bekleyenAdet} adet)`}
          </button>
        </div>
      )}

      {/* Ödeme Al */}
      {adisyon.kalemler.length > 0 && !odemeAcik && (
        <button
          onClick={() => setOdemeAcik(true)}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
        >
          💰 Ödeme Al ({paraFormat(adisyon.toplam)} ₺)
        </button>
      )}

      {/* Ödeme Formu */}
      {odemeAcik && (
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 space-y-3">
          <h4 className="font-bold text-green-800">Ödeme Bilgileri</h4>

          <div>
            <label className="block text-sm font-medium mb-1">Ödeme Yöntemi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'nakit', l: '💵 Nakit' },
                { v: 'kredi_karti', l: '💳 Kredi Kartı' },
                { v: 'pos', l: '📟 POS' },
                { v: 'iban', l: '🏦 IBAN' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => {
                    setOdemeYontemi(o.v);
                    otomatikKasaSec(o.v);
                  }}
                  className={`border-2 rounded-lg py-2 font-medium transition ${odemeYontemi === o.v
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white border-gray-300 hover:border-green-400'
                    }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kasa</label>
            <select
              value={kasaId}
              onChange={(e) => setKasaId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Kasa Seç --</option>
              {kasaHesaplari.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} ({k.tip}) — {paraFormat(k.bakiye)} ₺
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={odemeAl}
              disabled={kapatPending || !kasaId}
              className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {kapatPending ? 'Kaydediliyor...' : '✓ Ödemeyi Tamamla'}
            </button>
            <button
              onClick={() => setOdemeAcik(false)}
              disabled={kapatPending}
              className="bg-gray-300 px-4 py-3 rounded hover:bg-gray-400"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}