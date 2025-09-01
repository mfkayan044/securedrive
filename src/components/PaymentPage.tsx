import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
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
    if (reservationId) fetchReservation();
  }, [reservationId]);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error || !reservation) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-lg mx-auto my-12 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Rezervasyon Ödeme</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Rezervasyon Özeti</h2>
        <ul className="text-gray-700 space-y-1">
          <li><b>Rezervasyon No:</b> #{reservation.reservation_number || reservation.id.slice(0,8)}</li>
          <li><b>Müşteri:</b> {reservation.customer_name} ({reservation.customer_email})</li>
          <li><b>Telefon:</b> {reservation.customer_phone}</li>
          <li><b>Tarih:</b> {new Date(reservation.departure_date).toLocaleDateString('tr-TR')} {reservation.departure_time}</li>
          <li><b>Tutar:</b> <span className="text-blue-600 font-bold">{reservation.total_price} ₺</span></li>
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Kart ile Ödeme</h2>
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
          (Buraya gerçek ödeme entegrasyonu eklenebilir)
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">Ödemeyi Tamamla</button>
    </div>
  );
};

export default PaymentPage;
