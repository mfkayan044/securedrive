import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import QNBPaymentForm from '../QNBPaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  onClose: () => void;
  onPaymentSuccess: (paymentInfo?: any, couponCode?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, totalPrice, onClose, onPaymentSuccess }) => {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkingCoupon, setCheckingCoupon] = useState(false);


  const finalAmount = totalPrice - discount;

  if (!isOpen) return null;

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

        {/* QNB Payment Form */}
        <div className="p-6">
          <QNBPaymentForm
            amount={finalAmount}
            orderId={`RES_${Date.now()}`}
            customerInfo={{
              name: 'Müşteri', // Bu bilgiyi rezervasyon formundan alabilirsin
              email: 'musteri@example.com',
              phone: '5551234567'
            }}
            onPaymentSuccess={handleQNBPaymentSuccess}
            onPaymentError={handleQNBPaymentError}
          />
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
