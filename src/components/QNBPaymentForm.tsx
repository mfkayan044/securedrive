import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface QNBPaymentFormProps {
  amount: number;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const QNBPaymentForm: React.FC<QNBPaymentFormProps> = ({
  amount,
  orderId,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Kart numarası formatı (4-4-4-4)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return match;
    }
  };

  // Son kullanma tarihi formatı (MM/YY)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  };

  // Kart tipini belirleme
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    return 'Kredi Kartı';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // Form validasyonu
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      if (cardNumber.replace(/\s/g, '').length < 16) {
        throw new Error('Geçerli bir kart numarası girin');
      }

      if (expiryDate.length !== 5) {
        throw new Error('Geçerli bir son kullanma tarihi girin (MM/YY)');
      }

      if (cvv.length < 3) {
        throw new Error('Geçerli bir CVV kodu girin');
      }

      // QNB Bank ödeme API'sine istek gönder
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry: expiryDate.replace('/', ''),
          cardCvv: cvv,
          cardHolder: cardHolder.toUpperCase(),
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone
        })
      });

      const result = await response.json();

      if (result.success) {
        // 3D Secure sayfasına yönlendirme
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          onPaymentSuccess(result);
        }
      } else {
        throw new Error(result.error || 'Ödeme işlemi başarısız');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi sırasında hata oluştu';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">QNB Bank Ödeme</h2>
          <Lock className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Tutar gösterimi */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <div className="text-sm text-gray-600 mb-1">Ödenecek Tutar</div>
        <div className="text-2xl font-bold text-blue-600">{amount.toFixed(2)} ₺</div>
        <div className="text-xs text-gray-500 mt-1">Sipariş No: {orderId}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kart Numarası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kart Numarası
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-500">
              {cardNumber && getCardType(cardNumber)}
            </div>
          </div>
        </div>

        {/* Kart Sahibi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kart Sahibinin Adı
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder="KART SAHİBİNİN ADI"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
        </div>

        {/* Son Kullanma ve CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Son Kullanma Tarihi
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              maxLength={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Güvenlik bilgisi */}
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700">
            Bu işlem QNB Bank güvenli ödeme sistemi ile korunmaktadır.
          </span>
        </div>

        {/* Ödeme butonu */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>İşleniyor...</span>
            </div>
          ) : (
            `${amount.toFixed(2)} ₺ Öde`
          )}
        </button>
      </form>

      {/* QNB Bank logosu */}
      <div className="mt-6 text-center">
        <div className="text-xs text-gray-500">Güvenli ödeme sağlayıcısı:</div>
        <div className="text-sm font-semibold text-blue-800 mt-1">QNB Finansbank</div>
        <div className="text-xs text-gray-400 mt-1">AZZ TUR - Üye İşyeri: 106600000017400</div>
      </div>
    </div>
  );
};

export default QNBPaymentForm;