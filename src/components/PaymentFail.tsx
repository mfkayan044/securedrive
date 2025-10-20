import React, { useEffect, useState } from 'react';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // QNB'den dönen tüm parametreleri yakala
    const data: any = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });
    
    console.log('QNB Fail Callback Data:', data);
    setPaymentData(data);

  }, [searchParams]);

  const handleRetry = () => {
    // Ödeme sayfasına geri dön
    if (paymentData?.MrcOrderId) {
      navigate(`/payment?orderId=${paymentData.MrcOrderId}`);
    } else {
      navigate('/user/reservations');
    }
  };

  const getErrorMessage = (errorCode: string, errorMsg: string) => {
    // Yaygın hata kodlarını kullanıcı dostu mesajlara çevir
    const errorMessages: { [key: string]: string } = {
      'M030': 'Hash doğrulaması başarısız. Lütfen tekrar deneyin.',
      'M001': 'Yetersiz bakiye. Lütfen başka bir kart deneyin.',
      'M002': 'Kart limitini aştınız.',
      'M003': 'Geçersiz kart bilgileri.',
      'M004': 'Kartınız bu işlem için uygun değil.',
      'M005': '3D Secure doğrulaması başarısız.',
    };
    return errorMessages[errorCode] || errorMsg || 'Ödeme işlemi başarısız oldu.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Hata İkonu */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Ödeme Başarısız
        </h1>
        <p className="text-center text-gray-600 mb-6">
          İşleminiz tamamlanamadı
        </p>

        {/* Hata Detayları */}
        {paymentData && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Hata Nedeni:</p>
                <p className="text-sm text-red-700">
                  {getErrorMessage(
                    paymentData.ProcReturnCode,
                    paymentData.ErrMsg
                  )}
                </p>
              </div>
            </div>

            {paymentData.ProcReturnCode && (
              <div className="flex justify-between items-center pt-3 border-t border-red-200">
                <span className="text-sm text-red-600">Hata Kodu</span>
                <span className="font-mono text-sm text-red-800">
                  {paymentData.ProcReturnCode}
                </span>
              </div>
            )}
          </div>
        )}

        {/* İşlem Detayları */}
        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
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
              <span className="text-sm text-gray-600">Tutar</span>
              <span className="font-semibold text-gray-800">
                {paymentData.PurchAmount} TL
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tarih</span>
              <span className="text-sm">
                {paymentData.TransactionDate || new Date().toLocaleString('tr-TR')}
              </span>
            </div>

            {paymentData.CardMask && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kart</span>
                <span className="text-sm">
                  {paymentData.CardMask}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bilgilendirme */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Ne yapabilirsiniz?</strong><br />
            • Kart bilgilerinizi kontrol edip tekrar deneyin<br />
            • Başka bir kart ile ödeme yapın<br />
            • Bankanızla iletişime geçin<br />
            • Müşteri hizmetlerimizden destek alın
          </p>
        </div>

        {/* Butonlar */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Tekrar Dene</span>
          </button>

          <button
            onClick={() => navigate('/user/dashboard')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>

        {/* Destek */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Yardıma mı ihtiyacınız var?</p>
          <a
            href="mailto:destek@securedrive.org"
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Müşteri Hizmetleri ile İletişime Geçin
          </a>
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

export default PaymentFail;
