
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import QNBPaymentForm from '../QNBPaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  orderId: string;
  onClose: () => void;
  onPaymentSuccess: (paymentInfo?: any, couponCode?: string) => void;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  reservationData?: any; // Rezervasyon bilgileri
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  totalPrice, 
  orderId, 
  onClose, 
  onPaymentSuccess,
  customerInfo,
  reservationData
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkingCoupon, setCheckingCoupon] = useState(false);


  const finalAmount = totalPrice - discount;

  if (!isOpen) return null;

  // Eğer kupon ile tutar 0 TL'ye düştüyse, direkt başarılı olarak işle
  const handleFreePurchase = () => {
    console.log('Free purchase with coupon, finalAmount:', finalAmount);
    onPaymentSuccess({ 
      paymentMethod: 'Kupon (%100 İndirim)',
      transactionId: 'FREE_' + Date.now(),
      amount: 0,
      couponApplied: true
    }, couponCode);
  };

  const handleQNBPaymentSuccess = (result: any) => {
    console.log('QNB Payment Success:', result);
    // Başarılı ödeme sonrası işlemler
    onPaymentSuccess({ 
      paymentMethod: 'QNB Bank',
      transactionId: result.transactionId || 'QNB_' + Date.now(),
      amount: finalAmount
    }, couponCode);
  };

  const handleQNBPaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Kupon kodunu kontrol et
  const handleApplyCoupon = async () => {
    setCheckingCoupon(true);
    setError('');
    setCouponApplied(false);
    setDiscount(0);
    if (!couponCode) {
      setError('Lütfen bir kupon kodu girin.');
      setCheckingCoupon(false);
      return;
    }
    try {
      if (!supabase) {
        setError('Sunucu bağlantısı hatası.');
        setCheckingCoupon(false);
        return;
      }
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();
      if (error || !data) {
        setError('Geçersiz veya kullanımda olmayan kupon kodu.');
        setCheckingCoupon(false);
        return;
      }
      // İndirim oranı veya miktarı uygula
      let discountAmount = 0;
      if (data.discount_type === 'percent') {
        discountAmount = Math.round((totalPrice * Number(data.discount_value)) / 100);
      } else if (data.discount_type === 'amount') {
        discountAmount = Math.min(Number(data.discount_value), totalPrice);
      }
      setDiscount(discountAmount);
      setCouponApplied(true);
      setError('');
    } catch (e) {
      setError('Kupon kontrolü sırasında hata oluştu.');
    }
    setCheckingCoupon(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Kupon Kodu Bölümü */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Kupon Kodu (İsteğe Bağlı)</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kupon kodunuz varsa girin"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              disabled={couponApplied}
            />
            <button
              type="button"
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold ${checkingCoupon ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleApplyCoupon}
              disabled={checkingCoupon || couponApplied}
            >
              {checkingCoupon ? 'Kontrol...' : couponApplied ? 'Uygulandı' : 'Uygula'}
            </button>
          </div>
          {couponApplied && discount > 0 && (
            <div className="text-green-600 text-sm mt-2">✓ Kupon uygulandı! İndirim: {discount} ₺</div>
          )}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>

        {/* QNB Payment Form veya Ücretsiz Rezervasyon */}
        <div className="p-6">
          {finalAmount <= 0 ? (
            // Tutar 0 TL veya negatifse, ödeme formu gösterme
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Kupon Uygulandı!</h3>
                <p className="text-gray-600 mb-4">
                  Kupon kodunuz sayesinde rezervasyonunuz tamamen ücretsiz.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600">Toplam Tutar</div>
                  <div className="text-3xl font-bold text-green-600">{totalPrice.toFixed(2)} ₺</div>
                  <div className="text-sm text-gray-600 mt-1">İndirim: -{discount.toFixed(2)} ₺</div>
                  <div className="text-xl font-bold text-green-600 mt-2">Ödenecek: 0.00 ₺</div>
                </div>
              </div>
              <button
                onClick={handleFreePurchase}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Ücretsiz Rezervasyonu Tamamla
              </button>
            </div>
          ) : (
            // Normal ödeme akışı
            <QNBPaymentForm
              amount={finalAmount}
              orderId={orderId}
              customerInfo={customerInfo || {
                name: 'Müşteri',
                email: 'musteri@example.com',
                phone: '5551234567'
              }}
              reservationData={reservationData}
              onPaymentSuccess={handleQNBPaymentSuccess}
              onPaymentError={handleQNBPaymentError}
            />
          )}
        </div>

        {/* Kapatma Butonu */}
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
