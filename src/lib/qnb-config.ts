// QNB Bank Sanal POS Entegrasyon Konfigürasyonu
export const QNB_CONFIG = {
  // Test ortamı (AZZ TUR)
  TEST: {
    PAYMENT_URL: 'https://vpostest.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: import.meta.env.VITE_QNB_TEST_MERCHANT_ID || '106600000017400',
    MERCHANT_PASS: import.meta.env.VITE_QNB_TEST_MERCHANT_PASS || '29222247',
    USER_CODE: import.meta.env.VITE_QNB_TEST_USER_CODE || 'azzturapi2',
    USER_PASS: import.meta.env.VITE_QNB_TEST_USER_PASS || 'WkhJ8',
    TERMINAL_ID: import.meta.env.VITE_QNB_TEST_TERMINAL_ID || 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  },
  
  // Production ortamı (AZZ TUR)
  PRODUCTION: {
    PAYMENT_URL: 'https://vpos.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: import.meta.env.VITE_QNB_MERCHANT_ID || '106600000017400',
    MERCHANT_PASS: import.meta.env.VITE_QNB_MERCHANT_PASS || '29222247',
    USER_CODE: import.meta.env.VITE_QNB_USER_CODE || 'azzturapi2',
  USER_PASS: import.meta.env.VITE_QNB_USER_PASS || 'g42rG',
    TERMINAL_ID: import.meta.env.VITE_QNB_TERMINAL_ID || 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  }
};

// Aktif ortamı belirleme
export const getQNBConfig = () => {
  const isProduction = import.meta.env.MODE === 'production' && import.meta.env.VITE_QNB_ENVIRONMENT === 'production';
  return isProduction ? QNB_CONFIG.PRODUCTION : QNB_CONFIG.TEST;
};

// QNB Bank Error Kodları
export const QNB_ERROR_CODES: { [key: string]: string } = {
  '00': 'İşlem başarılı',
  '01': 'Kartı veren bankaya başvurun',
  '02': 'Kartı veren bankaya başvurun',
  '03': 'Geçersiz işyeri',
  '04': 'Karta el koyunuz',
  '05': 'İşlem onaylanmadı',
  '06': 'Hata',
  '07': 'Karta el koyunuz',
  '08': 'Kimlik doğrulayın',
  '09': 'Tekrar deneyin',
  '10': 'Tekrar deneyin',
  '11': 'VIP işlem',
  '12': 'Geçersiz işlem',
  '13': 'Geçersiz işlem tutarı',
  '14': 'Geçersiz kart numarası',
  '15': 'Kartı veren banka bulunamadı',
  '19': 'Tekrar deneyin',
  '21': 'İptal edilemez',
  '25': 'Kayıt bulunamadı',
  '28': 'Orijinal red',
  '30': 'Mesaj formatı hatası',
  '32': 'Dosyaya ulaşılamıyor',
  '33': 'Süresi dolmuş kart',
  '34': 'Sahtecilik şüphesi',
  '36': 'Kısıtlı kart',
  '38': 'İzin verilen PIN giriş sayısı aşıldı',
  '41': 'Kayıp kart',
  '43': 'Çalıntı kart',
  '51': 'Yetersiz bakiye',
  '52': 'Çek hesabı bulunamadı',
  '53': 'Tasarruf hesabı bulunamadı',
  '54': 'Süresi dolmuş kart',
  '55': 'Hatalı PIN',
  '56': 'Kart dosyada yok',
  '57': 'İşleme izin verilmiyor',
  '58': 'İşleme izin verilmiyor',
  '61': 'Para çekme limiti aşıldı',
  '62': 'Kısıtlı kart',
  '63': 'Güvenlik ihlali',
  '65': 'Günlük işlem adedi aşıldı',
  '75': 'İzin verilen PIN giriş sayısı aşıldı',
  '76': 'Anahtar senkronizasyon hatası',
  '77': 'İnkonsist veri',
  '78': 'İnkonsist veri',
  '80': 'Tarih geçersiz',
  '81': 'Şifreleme hatası',
  '82': 'CVV doğrulama hatası',
  '83': 'PIN doğrulama hatası',
  '85': 'Reddedildi',
  '91': 'Kartı veren banka servis dışı',
  '92': 'Bilinmeyen kart türü',
  '96': 'Sistem hatası',
  '98': 'Sistem hatası',
  '99': 'Sistem hatası'
};

export const getErrorMessage = (errorCode: string): string => {
  return QNB_ERROR_CODES[errorCode] || `Bilinmeyen hata kodu: ${errorCode}`;
};
