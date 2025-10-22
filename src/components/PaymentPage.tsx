import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import QNBPaymentForm from './QNBPaymentForm';

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<any>(null);
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

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error || !reservation)
    return <div className="p-8 text-center text-red-600">{error || 'Rezervasyon bulunamadı.'}</div>;

  return (
    <QNBPaymentForm
      amount={reservation.total_price}
      orderId={reservation.reservation_number || reservation.id}
      customerInfo={{
        name: reservation.customer_name,
        email: reservation.customer_email,
        phone: reservation.customer_phone
      }}
      onPaymentSuccess={() => {}}
      onPaymentError={() => {}}
      reservationData={reservation}
    />
  );
};

export default PaymentPage;
