import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    // QNB'den dönen tüm parametreleri yakala
    const data: any = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });
    
    console.log('QNB Success Callback Data:', data);
    setPaymentData(data);

    // Rezervasyonu kaydet
    saveReservation(data);

  }, [searchParams]);

  const saveReservation = async (paymentInfo: any) => {
    try {
      console.log('💾 Rezervasyon kaydediliyor...');
      
      // Backend'den rezervasyon bilgilerini çek
      const orderId = paymentInfo.MrcOrderId || paymentInfo.OrderId;
      if (!orderId) {
        console.error('❌ OrderId bulunamadı!');
        setSaving(false);
        return;
      }

      console.log('📡 Backend\'den rezervasyon bilgileri çekiliyor:', orderId);
      
      const response = await fetch(`https://api.securedrive.org/reservation/${orderId}`);
      if (!response.ok) {
        console.error('❌ Backend\'den rezervasyon bilgisi alınamadı');
        setSaving(false);
        return;
      }

      const pendingReservation = await response.json();
      console.log('📋 Rezervasyon bilgileri alındı:', pendingReservation);

      // İş kuralı: Rezervasyon onay durumu
      let reservationStatus = 'pending';
      const { data: ruleData } = await supabase
        .from('business_rules')
        .select('value')
        .eq('key', 'reservation_approval')
        .single();
      if (ruleData && ruleData.value === 'auto') {
        reservationStatus = 'confirmed';
      }

      // Rezervasyonu Supabase'e kaydet
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          customer_name: pendingReservation.customerName,
          customer_email: pendingReservation.customerEmail,
          customer_phone: pendingReservation.customerPhone,
          trip_type: pendingReservation.tripType,
          from_location_id: pendingReservation.fromLocation,
          to_location_id: pendingReservation.toLocation,
          vehicle_type_id: pendingReservation.vehicleType,
          departure_date: pendingReservation.departureDate,
          departure_time: pendingReservation.departureTime,
          return_date: pendingReservation.returnDate || null,
          return_time: pendingReservation.returnTime || null,
          passengers: pendingReservation.passengers,
          passenger_names: pendingReservation.passengerNames,
          departure_flight_code: pendingReservation.departureFlightCode || null,
          return_flight_code: pendingReservation.returnFlightCode || null,
          total_price: pendingReservation.currentPrice,
          notes: pendingReservation.notes || null,
          status: reservationStatus,
          payment_status: 'paid',
          payment_method: 'QNB Bank'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Rezervasyon kayıt hatası:', error);
        setSaving(false);
        return;
      }

      console.log('✅ Rezervasyon kaydedildi:', reservation.id);

      // Ekstra hizmetleri kaydet
      if (pendingReservation.selectedExtras && pendingReservation.selectedExtras.length > 0) {
        const extrasInsert = pendingReservation.selectedExtras.map((extraId: string) => ({
          reservation_id: reservation.id,
          extra_service_id: extraId
        }));
        await supabase.from('reservation_extras').insert(extrasInsert);
        console.log('✅ Ekstra hizmetler kaydedildi');
      }

      // Müşteriye voucher emaili gönder
      try {
        await fetch('/api/sendVoucherEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: pendingReservation.customerEmail,
            name: pendingReservation.customerName,
            voucherCode: reservation.id,
            reservationDetails: JSON.stringify({
              from: pendingReservation.fromLocation,
              to: pendingReservation.toLocation,
              date: pendingReservation.departureDate,
              time: pendingReservation.departureTime,
              passengers: pendingReservation.passengers,
              price: pendingReservation.currentPrice
            }, null, 2)
          })
        });
        console.log('✅ Müşteri email gönderildi');
      } catch (emailError) {
        console.error('❌ Müşteri email hatası:', emailError);
      }

      // Admin'e bildirim gönder
      try {
        await fetch('/api/notifyAdminOnReservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reservation: {
              customer_name: pendingReservation.customerName,
              customer_email: pendingReservation.customerEmail,
              customer_phone: pendingReservation.customerPhone,
              from_location_name: pendingReservation.fromLocation,
              to_location_name: pendingReservation.toLocation,
              departure_date: pendingReservation.departureDate,
              departure_time: pendingReservation.departureTime,
              notes: pendingReservation.notes
            }
          })
        });
        console.log('✅ Admin email gönderildi');
      } catch (adminEmailError) {
        console.error('❌ Admin email hatası:', adminEmailError);
      }

      setSaving(false);
      
    } catch (err) {
      console.error('❌ Rezervasyon kaydetme hatası:', err);
      setSaving(false);
    }
  };

  const handleContinue = () => {
    // Anasayfaya yönlendir
    window.location.href = 'https://www.securedrive.org';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Saving Indicator */}
        {saving && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">Rezervasyonunuz kaydediliyor...</span>
            </div>
          </div>
        )}

        {/* Başarı İkonu */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Ödeme Başarılı!
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {saving ? 'Rezervasyonunuz kaydediliyor...' : 'İşleminiz başarıyla tamamlandı'}
        </p>

        {/* Ödeme Detayları */}
        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">İşlem Tutarı</span>
              <span className="font-semibold text-lg text-green-600">
                {paymentData.PurchAmount} TL
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sipariş No</span>
              <span className="font-mono text-sm">
                {paymentData.MrcOrderId || paymentData.OrderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">İşlem No</span>
              <span className="font-mono text-sm">
                {paymentData.OrderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Onay Kodu</span>
              <span className="font-mono text-sm text-green-600">
                {paymentData.AuthCode || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tarih</span>
              <span className="text-sm">
                {paymentData.TransactionDate || new Date().toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kart</span>
              <span className="text-sm">
                {paymentData.CardMask || 'XXXX-XXXX-XXXX-XXXX'}
              </span>
            </div>
          </div>
        )}

        {/* Bilgilendirme */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ✓ Ödeme onayı e-posta adresinize gönderildi<br />
            ✓ Rezervasyon bilgilerinizi kullanıcı panelinden görüntüleyebilirsiniz
          </p>
        </div>

        {/* Butonlar */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Anasayfaya Git</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => window.print()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Dekontu İndir</span>
          </button>
        </div>

        {/* Alt bilgi */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>QNB Finansbank Güvenli Ödeme Sistemi</p>
          <p className="mt-1">İşlem Referans: {paymentData?.RequestGuid}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
