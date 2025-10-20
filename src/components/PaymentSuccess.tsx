import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // QNB'den dönen tüm parametreleri yakala
    const data: any = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });
    
    console.log('QNB Success Callback Data:', data);
    setPaymentData(data);

    // ResponseHash doğrulaması yapılabilir (opsiyonel)
    // verifyQNBResponseHash(data);

  }, [searchParams]);

  const handleContinue = () => {
    // Anasayfaya yönlendir
    window.location.href = 'https://www.securedrive.org';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
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
          İşleminiz başarıyla tamamlandı
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
