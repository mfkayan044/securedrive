import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Reservation {
  id: string;
  reservation_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_price: number;
  currency?: string;
}

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setError('Ödeme sayfası için rezervasyon ID bulunamadı. Linki kontrol edin.');
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', reservationId)
          .single();

        if (error || !data) throw new Error('Rezervasyon bulunamadı.');
        setReservation(data);
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  // Kart bilgileri state'leri
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isCardValid = () => {
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;
    return (
      cardRegex.test(cardNumber.replace(/\s+/g, '')) &&
      expiryRegex.test(cardExpiry) &&
      cvvRegex.test(cardCvv) &&
      cardHolder.trim().length > 0
    );
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPaymentError(null);

    if (!isCardValid()) {
      setPaymentError('Kart bilgilerini doğru girdiğinizden emin olun.');
      setPaying(false);
      return;
    }

    try {
      const response = await fetch('/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reservation!.total_price,
          mrcOrderId: reservation!.reservation_number || reservation!.id,
          okUrl: window.location.origin + '/payment/success',
          failUrl: window.location.origin + '/payment/fail',
          pan: cardNumber,
          expiry: cardExpiry,
          cvv2: cardCvv,
          cardHolderName: cardHolder,
          currency: reservation!.currency || '949',
          installmentCount: '0',
          txnType: 'Auth',
          lang: 'tr',
          reservationData: reservation
        })
      });

      if (!response.ok) {
        throw new Error('Sunucu hatası: ' + response.statusText);
      }

      const html = await response.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else {
        setPaymentError('Ödeme sayfası açılamadı (popup engellenmiş olabilir).');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Ödeme başlatılamadı.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error || !reservation)
    return <div className="p-8 text-center text-red-600">{error || 'Rezervasyon bulunamadı.'}</div>;

  return (
    <div className="max-w-lg mx-auto my-12 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Rezervasyon Ödeme</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Rezervasyon Özeti</h2>
        <ul className="text-gray-700 space-y-1">
          <li>
            <b>Rezervasyon No:</b> #{reservation.reservation_number || reservation.id.slice(0, 8)}
          </li>
          <li>
            <b>Müşteri:</b> {reservation.customer_name} ({reservation.customer_email})
          </li>
          <li>
            <b>Telefon:</b> {reservation.customer_phone}
          </li>
          <li>
            <b>Tutar:</b>{' '}
            <span className="text-blue-600 font-bold">{reservation.total_price} ₺</span>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Kart ile Ödeme</h2>
        <form onSubmit={handlePayment} className="space-y-4">
          <fieldset disabled={paying} className="space-y-4">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Kart Numarası (16 haneli)"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              maxLength={19}
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                className="w-1/2 border rounded px-3 py-2"
                placeholder="Son Kullanma (AA/YY)"
                value={cardExpiry}
                onChange={e => setCardExpiry(e.target.value)}
                maxLength={5}
                required
              />
              <input
                type="text"
                className="w-1/2 border rounded px-3 py-2"
                placeholder="CVV"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value)}
                maxLength={4}
                required
              />
            </div>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Kart Sahibi Adı"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value)}
              required
            />
          </fieldset>

          {paymentError && <div className="text-red-600 text-sm">{paymentError}</div>}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors ${
              paying ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            disabled={paying}
          >
            {paying ? 'Ödeme Başlatılıyor...' : 'Ödemeyi Tamamla'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
