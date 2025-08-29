
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  onClose: () => void;
  onPaymentSuccess: (cardInfo: { cardNumber: string; cardName: string; cardExpiry: string; cardCvc: string }, couponCode?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, totalPrice, onClose, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
      setError('Lütfen tüm kart bilgilerini doldurun.');
      return;
    }
    setError('');
    onPaymentSuccess({ cardNumber, cardName, cardExpiry, cardCvc }, couponCode);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Ödeme</h2>
        <p className="text-lg mb-2 text-center">Toplam Tutar: <span className="font-semibold text-red-600 line-through mr-2">{discount > 0 ? totalPrice : null}</span><span className="font-semibold text-green-600">{discount > 0 ? totalPrice - discount : totalPrice} ₺</span></p>
        {couponApplied && discount > 0 && (
          <div className="text-green-600 text-sm text-center mb-2">Kupon uygulandı! İndirim: {discount} ₺</div>
        )}
        {couponApplied && discount === 0 && (
          <div className="text-yellow-600 text-sm text-center mb-2">Kupon kodu geçerli ancak bu tutar için indirim uygulanmadı.</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kart Numarası</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={19}
              placeholder="•••• •••• •••• ••••"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ''))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kart Üzerindeki İsim</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ad Soyad"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              required
            />
          </div>
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Son Kullanma</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5}
                placeholder="AA/YY"
                value={cardExpiry}
                onChange={e => setCardExpiry(e.target.value.replace(/[^0-9/]/g, ''))}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">CVC</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                placeholder="•••"
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kupon Kodu (varsa)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kupon Kodu"
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
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <div className="flex space-x-4 justify-center mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Ödeme ve Rezervasyonu Tamamla
            </button>
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
              onClick={onClose}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
