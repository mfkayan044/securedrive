import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PaymentPage: React.FC = () => {
  // Route parametresi doğrudan reservationId olarak alınır
  const { reservationId } = useParams<{ reservationId: string }>();
  const [paramError, setParamError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();
      if (error) setError('Rezervasyon bulunamadı.');
      else setReservation(data);
      setLoading(false);
    };
    if (!reservationId) {
      setParamError('Ödeme sayfası için rezervasyon ID bulunamadı. Linki kontrol edin.');
      setLoading(false);
      return;
    }
    fetchReservation();
  }, [reservationId]);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (paramError) return <div className="p-8 text-center text-red-600">{paramError}</div>;
  if (error || !reservation) return <div className="p-8 text-center text-red-600">{error || 'Rezervasyon bulunamadı.'}</div>;

  // Kart bilgileri için state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Ödeme formu submit
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPaymentError(null);
    try {
      const response = await fetch('/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reservation.total_price,
          mrcOrderId: reservation.reservation_number || reservation.id,
          okUrl: window.location.origin + '/payment/success',
          failUrl: window.location.origin + '/payment/fail',
          pan: cardNumber,
          expiry: cardExpiry,
          cvv2: cardCvv,
          cardHolderName: cardHolder,
          currency: reservation.currency || '949',
          installmentCount: '0',
          txnType: 'Auth',
          lang: 'tr',
          reservationData: reservation
        })
      });
      const html = await response.text();
      // Sunucudan dönen HTML'i yeni bir pencere açıp göster
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else {
        setPaymentError('Ödeme sayfası açılamadı.');
      }
    } catch (err) {
      setPaymentError('Ödeme başlatılamadı.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-12 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Rezervasyon Ödeme</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Rezervasyon Özeti</h2>
        <ul className="text-gray-700 space-y-1">
          <li><b>Rezervasyon No:</b> #{reservation.reservation_number || reservation.id.slice(0,8)}</li>
          <li><b>Müşteri:</b> {reservation.customer_name} ({reservation.customer_email})</li>
          <li><b>Telefon:</b> {reservation.customer_phone}</li>
          <li><b>Tutar:</b> <span className="text-blue-600 font-bold">{reservation.total_price} ₺</span></li>
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Kart ile Ödeme</h2>
        <form onSubmit={handlePayment} className="space-y-4">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Kart Numarası"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            required
            maxLength={19}
          />
          <div className="flex gap-2">
            <input
              type="text"
              className="w-1/2 border rounded px-3 py-2"
              placeholder="Son Kullanma (AA/YY)"
              value={cardExpiry}
              onChange={e => setCardExpiry(e.target.value)}
              required
              maxLength={5}
            />
            <input
              type="text"
              className="w-1/2 border rounded px-3 py-2"
              placeholder="CVV"
              value={cardCvv}
              onChange={e => setCardCvv(e.target.value)}
              required
              maxLength={4}
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
          {paymentError && <div className="text-red-600 text-sm">{paymentError}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
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
