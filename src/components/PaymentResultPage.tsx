import React from 'react';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface PaymentResultPageProps {
  type: 'success' | 'error';
  orderId?: string;
  transactionId?: string;
  errorMessage?: string;
  amount?: number;
  onBackToHome: () => void;
}

const PaymentResultPage: React.FC<PaymentResultPageProps> = ({
  type,
  orderId,
  transactionId,
  errorMessage,
  amount,
  onBackToHome
}) => {
  const isSuccess = type === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          {isSuccess ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          )}
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold mb-4 ${
          isSuccess ? 'text-green-800' : 'text-red-800'
        }`}>
          {isSuccess ? 'Ödeme Başarılı!' : 'Ödeme Başarısız!'}
        </h1>

        {/* Message */}
        <div className="text-gray-600 mb-6">
          {isSuccess ? (
            <div>
              <p className="mb-2">Ödemeniz başarıyla işleme alınmıştır.</p>
              {amount && (
                <p className="text-lg font-semibold text-green-600 mb-2">
                  {amount.toFixed(2)} ₺
                </p>
              )}
              <p className="text-sm">
                Rezervasyon detayları e-posta adresinize gönderilmiştir.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-2">Ödeme işlemi tamamlanamadı.</p>
              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {errorMessage}
                </p>
              )}
              <p className="text-sm mt-2">
                Lütfen tekrar deneyiniz veya farklı bir ödeme yöntemi kullanınız.
              </p>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        {isSuccess && (orderId || transactionId) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">İşlem Detayları</h3>
            {orderId && (
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Sipariş No:</span> {orderId}
              </div>
            )}
            {transactionId && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">İşlem No:</span> {transactionId}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isSuccess ? (
            <>
              <button
                onClick={onBackToHome}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Ana Sayfaya Dön
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Bu Sayfayı Yazdır
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
              <button
                onClick={onBackToHome}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ana Sayfaya Dön</span>
              </button>
            </>
          )}
        </div>

        {/* QNB Bank Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Güvenli ödeme sağlayıcısı: <span className="font-semibold">QNB Finansbank</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;