import axios from 'axios';
import xml2js from 'xml2js';
import { createClient } from '@supabase/supabase-js';

// QNB Bank Sanal POS Konfigürasyonu (AZZ TUR)
const QNB_CONFIG = {
  TEST: {
    PAYMENT_URL: 'https://vpostest.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: '106600000017400',
    MERCHANT_PASS: '29222247',
    USER_CODE: 'azzturapi2',
    USER_PASS: 'WkhJ8',
    TERMINAL_ID: 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  },
  PRODUCTION: {
    PAYMENT_URL: 'https://vpos.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: '106600000017400',
    MERCHANT_PASS: '29222247',
    USER_CODE: 'azzturapi2',
    USER_PASS: 'WkhJ8',
    TERMINAL_ID: 'V1787296',
    SECURE_TYPE: '3DModel',
    CURRENCY_CODE: '949', // TRY
    LANG: 'TR'
  }
};

const getQNBConfig = () => QNB_CONFIG.TEST;

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
  amount: number;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolder: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  errorUrl: string;
}

// 3D Secure başlatma fonksiyonu (örnek, gerçek API çağrısı eklenmeli)
export async function initiate3DPayment(paymentRequest: QNBPaymentRequest): Promise<any> {
  const config = {
    PAYMENT_URL: 'https://vpostest.qnbfinansbank.com/Gateway/XMLGate.aspx',
    MERCHANT_ID: '106600000017400',
    MERCHANT_PASS: '29222247',
    USER_CODE: 'azzturapi2',
    USER_PASS: 'WkhJ8',
    TERMINAL_ID: 'V1787296',
    CURRENCY_CODE: '949',
    LANG: 'TR'
  };

  // Kart bilgileri ve sipariş detayları ile XML oluştur
  const xml = `
    <GVPSRequest>
      <Mode>TEST</Mode>
      <Version>v0.01</Version>
      <Terminal>
        <ProvUserID>${config.USER_CODE}</ProvUserID>
        <HashData></HashData>
        <UserID>${config.USER_CODE}</UserID>
        <ID>${config.TERMINAL_ID}</ID>
        <MerchantID>${config.MERCHANT_ID}</MerchantID>
      </Terminal>
      <Customer>
        <IPAddress>127.0.0.1</IPAddress>
        <EmailAddress>${paymentRequest.customerEmail || ''}</EmailAddress>
      </Customer>
      <Card>
        <Number>${paymentRequest.cardNumber}</Number>
        <ExpireDate>${paymentRequest.cardExpiry}</ExpireDate>
        <CVV2>${paymentRequest.cardCvv}</CVV2>
      </Card>
      <Order>
        <OrderID>${paymentRequest.orderId}</OrderID>
      </Order>
      <Transaction>
        <Type>sales</Type>
        <InstallmentCnt>0</InstallmentCnt>
        <Amount>${paymentRequest.amount}</Amount>
        <CurrencyCode>${config.CURRENCY_CODE}</CurrencyCode>
        <CardholderPresentCode>0</CardholderPresentCode>
        <MotoInd>N</MotoInd>
        <Secure3D>
          <AuthenticationCode></AuthenticationCode>
          <SecurityLevel></SecurityLevel>
          <TxnID></TxnID>
          <Md></Md>
        </Secure3D>
      </Transaction>
    </GVPSRequest>
  `;

  // XML'i bankaya gönder
  const response = await axios.post(config.PAYMENT_URL, xml, {
    headers: { 'Content-Type': 'text/xml' }
  });

  // XML cevabını parse et
  const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });

  // 3D yönlendirme linkini al
  const redirectUrl = parsed?.GVPSResponse?.Transaction?.Secure3D?.Html;

  if (redirectUrl) {
    return {
      success: true,
      redirectUrl,
      orderId: paymentRequest.orderId
    };
  } else {
    return {
      success: false,
      message: parsed?.GVPSResponse?.ReasonCode || 'Banka yanıtı alınamadı'
    };
  }
}

// 3D Secure doğrulama fonksiyonu (örnek, gerçek API çağrısı eklenmeli)
export async function verify3DPayment(callbackData: any): Promise<any> {
  // ... QNB API ile doğrulama işlemleri ...
  // Burada gerçek API çağrısı yapılmalı
  return {
    success: true,
    orderId: callbackData.orderId,
    transactionId: 'dummy-transaction-id',
    authCode: 'dummy-auth-code',
    message: 'Ödeme başarılı'
  };
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const action = req.query.action;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (action === 'initiate') {
    // Ödeme başlatma
    try {
      console.log('Ödeme başlatılıyor, gelen body:', req.body);
      const {
        orderId,
        amount,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        customerEmail,
        customerPhone
      } = req.body;

      if (!orderId || !amount || !cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
        return res.status(400).json({
          error: 'Eksik ödeme bilgileri',
          missing: 'orderId, amount, cardNumber, cardExpiry, cardCvv, cardHolder gerekli'
        });
      }

      const baseUrl = req.headers.origin || `https://${req.headers.host}`;
      const returnUrl = `${baseUrl}/payment-success`;
      const errorUrl = `${baseUrl}/payment-error`;

      const paymentRequest: QNBPaymentRequest = {
        orderId,
        amount: Math.round(amount * 100),
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        customerEmail,
        customerPhone,
        returnUrl,
        errorUrl
      };

      console.log('QNB Payment Request:', { orderId, amount: paymentRequest.amount, returnUrl, errorUrl });
      const result = await initiate3DPayment(paymentRequest);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          redirectUrl: result.redirectUrl,
          orderId: result.orderId
        });
      } else {
        console.log('QNB Payment Error:', result);
        return res.status(400).json({
          success: false,
          error: result.message || 'Ödeme başlatılamadı'
        });
      }
    } catch (error) {
      console.error('initiate-payment error:', error);
      if (error.response) {
        console.error('QNB yanıtı:', error.response.data);
      }
      return res.status(500).json({ error: error.message || 'Ödeme başlatılırken hata oluştu' });
    }
  } else if (action === 'callback') {
    // 3D Secure callback
    try {
      console.log('Payment callback received:', req.body);
      const verificationResult = await verify3DPayment(req.body);

      if (verificationResult.success) {
        const { orderId, transactionId, authCode } = verificationResult;
        const { error } = await supabase
          .from('reservations')
          .update({
            payment_status: 'paid',
            payment_method: 'QNB Bank Kredi Kartı',
            payment_id: transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({
            error: 'Ödeme başarılı ancak rezervasyon güncellenemedi',
            details: error.message
          });
        }

        console.log('Payment successful and reservation updated:', { orderId, transactionId });
        return res.redirect(302, `/payment-success?orderId=${orderId}&transactionId=${transactionId}`);
      } else {
        console.log('Payment failed:', verificationResult);
        return res.redirect(302, `/payment-error?error=${encodeURIComponent(verificationResult.message)}&orderId=${verificationResult.orderId}`);
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      return res.redirect(302, `/payment-error?error=${encodeURIComponent('Ödeme doğrulama sırasında hata oluştu')}`);
    }
  } else {
    return res.status(400).json({ error: 'Geçersiz action parametresi' });
  }
}
