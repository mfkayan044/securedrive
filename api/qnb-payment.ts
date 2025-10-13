import crypto from 'crypto';

// QNB Bank Sanal POS Konfigürasyonu (AZZ TUR)
const QNB_CONFIG = {
  // Test ortamı
  TEST: {
    PAYMENT_URL: 'https://vpostest.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: process.env.QNB_TEST_MERCHANT_ID || '106600000017400',
    MERCHANT_PASS: process.env.QNB_TEST_MERCHANT_PASS || '29222247',
    USER_CODE: process.env.QNB_TEST_USER_CODE || 'azzturapi2',
    USER_PASS: process.env.QNB_TEST_USER_PASS || 'WkhJ8',
    TERMINAL_ID: process.env.QNB_TEST_TERMINAL_ID || 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  },
  
  // Production ortamı
  PRODUCTION: {
    PAYMENT_URL: 'https://vpos.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: process.env.QNB_MERCHANT_ID || '106600000017400',
    MERCHANT_PASS: process.env.QNB_MERCHANT_PASS || '29222247',
    USER_CODE: process.env.QNB_USER_CODE || 'azzturapi2',
    USER_PASS: process.env.QNB_USER_PASS || 'WkhJ8',
    TERMINAL_ID: process.env.QNB_TERMINAL_ID || 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  }
};

// Aktif ortamı belirleme
const getQNBConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' && process.env.QNB_ENVIRONMENT === 'production';
  return isProduction ? QNB_CONFIG.PRODUCTION : QNB_CONFIG.TEST;
};

// QNB Bank Error Kodları
const QNB_ERROR_CODES: { [key: string]: string } = {
  '00': 'İşlem başarılı',
  '01': 'Kartı veren bankaya başvurun',
  '05': 'İşlem onaylanmadı',
  '12': 'Geçersiz işlem',
  '13': 'Geçersiz işlem tutarı',
  '14': 'Geçersiz kart numarası',
  '51': 'Yetersiz bakiye',
  '54': 'Süresi dolmuş kart',
  '57': 'İşleme izin verilmiyor',
  '82': 'CVV doğrulama hatası',
  '96': 'Sistem hatası'
};

const getErrorMessage = (errorCode: string): string => {
  return QNB_ERROR_CODES[errorCode] || `Bilinmeyen hata kodu: ${errorCode}`;
};

export interface QNBPaymentRequest {
  orderId: string;
  amount: number; // Kuruş cinsinden (örn: 100.50 TL = 10050)
  cardNumber: string;
  cardExpiry: string; // MMYY formatında
  cardCvv: string;
  cardHolder: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  errorUrl: string;
}

export interface QNBPaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  transactionId?: string;
  errorCode?: string;
  redirectUrl?: string;
  authCode?: string;
}

// MD5 hash oluşturma fonksiyonu
const createMD5Hash = (data: string): string => {
  return crypto.createHash('md5').update(data, 'utf8').digest('hex').toLowerCase();
};

// QNB Bank 3D Secure ödeme başlatma
export const initiate3DPayment = async (paymentData: QNBPaymentRequest): Promise<QNBPaymentResponse> => {
  try {
    const config = getQNBConfig();
    
    // Hash string oluşturma (QNB Bank'ın dokümantasyonuna göre)
    const hashString = `${config.MERCHANT_ID}${paymentData.orderId}${paymentData.amount}${paymentData.returnUrl}${paymentData.errorUrl}${config.MERCHANT_PASS}`;
    const hash = createMD5Hash(hashString);

    // 3D Secure başlatma parametreleri
    const params = {
      MerchantId: config.MERCHANT_ID,
      MerchantPassword: config.MERCHANT_PASS,
      UserCode: config.USER_CODE,
      UserPassword: config.USER_PASS,
      SecureType: config.SECURE_TYPE,
      TxnType: 'Sale',
      InstallmentCount: '',
      Amount: paymentData.amount.toString(),
      CurrencyCode: config.CURRENCY_CODE,
      OrderId: paymentData.orderId,
      OkUrl: paymentData.returnUrl,
      FailUrl: paymentData.errorUrl,
      Rnd: Math.random().toString(),
      Hash: hash,
      CardNumber: paymentData.cardNumber.replace(/\s/g, ''),
      CardExpireDateYear: '20' + paymentData.cardExpiry.substring(2, 4),
      CardExpireDateMonth: paymentData.cardExpiry.substring(0, 2),
      CardCvv2: paymentData.cardCvv,
      CardHolderName: paymentData.cardHolder,
      Lang: config.LANG
    };

    // Form verisi oluşturma
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // QNB Bank'a istek gönderme
    const response = await fetch(config.PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Ödeme servisine bağlanılamadı',
        errorCode: 'CONNECTION_ERROR'
      };
    }

    const responseText = await response.text();
    
    // Başarılı 3D yönlendirme kontrolü
    if (responseText.includes('3DSecure') || responseText.includes('form')) {
      return {
        success: true,
        message: '3D Secure doğrulamasına yönlendiriliyor',
        orderId: paymentData.orderId,
        redirectUrl: config.PAYMENT_URL
      };
    }

    return {
      success: false,
      message: 'Ödeme başlatılamadı',
      errorCode: 'PAYMENT_INIT_ERROR'
    };

  } catch (error) {
    console.error('QNB Payment Error:', error);
    return {
      success: false,
      message: 'Ödeme işlemi sırasında hata oluştu',
      errorCode: 'SYSTEM_ERROR'
    };
  }
};

// 3D Secure sonucu doğrulama
export const verify3DPayment = async (postData: any): Promise<QNBPaymentResponse> => {
  try {
    const config = getQNBConfig();
    
    // Gelen POST verilerini kontrol et
    const {
      MerchantId,
      OrderId,
      Amount,
      OkUrl,
      FailUrl,
      AuthCode,
      ProcReturnCode,
      Response,
      mdStatus,
      Hash
    } = postData;

    // Hash doğrulama
    const expectedHash = createMD5Hash(`${MerchantId}${OrderId}${Amount}${OkUrl}${FailUrl}${AuthCode}${ProcReturnCode}${Response}${mdStatus}${config.MERCHANT_PASS}`);
    
    if (Hash !== expectedHash) {
      return {
        success: false,
        message: 'Güvenlik doğrulaması başarısız',
        errorCode: 'HASH_MISMATCH'
      };
    }

    // 3D Secure durumu kontrolü
    if (mdStatus !== '1') {
      return {
        success: false,
        message: '3D Secure doğrulaması başarısız',
        errorCode: 'MD_STATUS_ERROR'
      };
    }

    // İşlem durumu kontrolü
    if (ProcReturnCode === '00' && Response === 'Approved') {
      return {
        success: true,
        message: 'Ödeme başarıyla tamamlandı',
        orderId: OrderId,
        transactionId: AuthCode,
        authCode: AuthCode
      };
    }

    return {
      success: false,
      message: getErrorMessage(ProcReturnCode),
      errorCode: ProcReturnCode,
      orderId: OrderId
    };

  } catch (error) {
    console.error('QNB Verification Error:', error);
    return {
      success: false,
      message: 'Ödeme doğrulama sırasında hata oluştu',
      errorCode: 'VERIFICATION_ERROR'
    };
  }
};

// İade işlemi
export const refundPayment = async (orderId: string, amount: number, authCode: string): Promise<QNBPaymentResponse> => {
  try {
    const config = getQNBConfig();
    
    const hashString = `${config.MERCHANT_ID}${orderId}${amount}${config.MERCHANT_PASS}`;
    const hash = createMD5Hash(hashString);

    const params = {
      MerchantId: config.MERCHANT_ID,
      MerchantPassword: config.MERCHANT_PASS,
      UserCode: config.USER_CODE,
      UserPassword: config.USER_PASS,
      TxnType: 'Refund',
      OriginalRetrefNum: authCode,
      Amount: amount.toString(),
      CurrencyCode: config.CURRENCY_CODE,
      OrderId: orderId,
      Hash: hash
    };

    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(config.PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    
    // XML response parsing burada yapılabilir
    // Şimdilik basit kontrol
    if (responseText.includes('00') || responseText.includes('Approved')) {
      return {
        success: true,
        message: 'İade işlemi başarıyla tamamlandı',
        orderId: orderId
      };
    }

    return {
      success: false,
      message: 'İade işlemi başarısız',
      errorCode: 'REFUND_ERROR'
    };

  } catch (error) {
    console.error('QNB Refund Error:', error);
    return {
      success: false,
      message: 'İade işlemi sırasında hata oluştu',
      errorCode: 'REFUND_SYSTEM_ERROR'
    };
  }
};