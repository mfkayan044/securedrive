import React, { useState, useRef, useEffect } from 'react';
// QNB 3D ödeme HTML yanıtını yeni pencerede açan fonksiyon
const openQNB3DWindow = (html: string) => {
  const win = window.open('', '_blank', 'width=600,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
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
  const [paymentHtml, setPaymentHtml] = useState<string | null>(null);

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
    // Form validasyonu
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      setError('Lütfen tüm alanları doldurun');
      setIsProcessing(false);
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Geçerli bir kart numarası girin');
      setIsProcessing(false);
      return;
    }
    if (expiryDate.length !== 5) {
      setError('Geçerli bir son kullanma tarihi girin (MM/YY)');
      setIsProcessing(false);
      return;
    }
    if (cvv.length < 3) {
      setError('Geçerli bir CVV kodu girin');
      setIsProcessing(false);
      return;
    }
    // QNB dokümana göre: orderId (veya mrcOrderId) backend'e iletilmeli
    const paymentData = {
      amount,
      pan: cardNumber.replace(/\s/g, ''),
      expiry: expiryDate.replace('/', ''),
      cvv2: cvv,
      cardHolderName: cardHolder.toUpperCase(),
      okUrl: 'https://api.securedrive.org/payment/success',
      failUrl: 'https://api.securedrive.org/payment/fail',
      installmentCount: '0',
      txnType: 'Auth',
      currency: '949',
      lang: 'TR',
      orderId // orderId backend'e iletiliyor (MrcOrderId olarak da kullanılacak)
    };
    try {
      // Sunucuya ödeme isteği gönder
      const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3000/payment';
      const response = await fetch(paymentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Payment API returned non-2xx status', response.status, text);
        setError(`Sunucu hatası: ${response.status}`);
        onPaymentError(`Sunucu hatası: ${response.status}`);
        setIsProcessing(false);
        return;
      }

      // QNB'den HTML yanıtı bekliyoruz (3D Secure form)
      const htmlResponse = await response.text();
      console.log('QNB HTML yanıtı alındı, 3D Secure sayfasına yönlendiriliyor...');

      // HTML'i ana pencerede render et (BKM 3D Secure otomatik submit olacak)
      // Bu sayede CORS ve 405 hataları engellenecek
      document.open();
      document.write(htmlResponse);
      document.close();
      
      // Not: Bu noktadan sonra sayfa BKM'ye yönlenecek ve
      // başarılı/başarısız durumda OkUrl/FailUrl'e geri dönecek
    } catch (err) {
      setError('Sunucu hatası: ' + (err as Error).message);
      onPaymentError('Sunucu hatası: ' + (err as Error).message);
    }
    setIsProcessing(false);
  };



  return (
  <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-red" />
          <h2 className="text-xl font-bold text-gray-800">QNB Bank Ödeme</h2>
          <Lock className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Tutar gösterimi */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <div className="text-sm text-gray-600 mb-1">Ödenecek Tutar</div>
        <div className="text-2xl font-bold text-red">{amount.toFixed(2)} ₺</div>
        <div className="text-xs text-gray-500 mt-1">Sipariş No: {orderId}</div>
      </div>

  <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kart Numarası */}
        <div>
          <label className="blocktext-sm font-medium text-gray-700 mb-1">
            Kart Numarası
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red"
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
              : 'bg-red  focus:ring-4 '
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
        <div className="text-sm font-semibold text-red mt-1">QNB Finansbank</div>
        <div className="text-xs text-gray-400 mt-1">AZZ TUR - Üye İşyeri: 106600000017400</div>
      </div>
    </div>
  );
};

export default QNBPaymentForm;
