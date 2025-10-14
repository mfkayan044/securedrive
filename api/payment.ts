import axios from 'axios';
import crypto from 'crypto';

// Banka örneğine tam uyumlu 3D ödeme fonksiyonu
export async function sendQNB3DPayment({
  mbrId,
  merchantId,
  amount,
  currency,
  orderId,
  installmentCount,
  txnType,
  userCode,
  userPass,
  secureType,
  pan,
  expiry,
  cvv2,
  okUrl,
  failUrl,
  lang
}: {
  mbrId: string;
  merchantId: string;
  amount: string;
  currency: string;
  orderId: string;
  installmentCount: string;
  txnType: string;
  userCode: string;
  userPass: string;
  secureType: string;
  pan: string;
  expiry: string;
  cvv2: string;
  okUrl: string;
  failUrl: string;
  lang: string;
}) {
  const rnd = Math.random().toString();
  // Hash algoritması: OrderId + MerchantId + Amount + OkUrl + FailUrl + UserCode + Rnd + UserPass
  const hashStr = orderId + merchantId + amount + okUrl + failUrl + userCode + rnd + userPass;
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PayforRequest>
  <MbrId>${mbrId}</MbrId>
  <MerchantId>${merchantId}</MerchantId>
  <PurchAmount>${amount}</PurchAmount>
  <Currency>${currency}</Currency>
  <OrderId>${orderId}</OrderId>
  <InstallmentCount>${installmentCount}</InstallmentCount>
  <TxnType>${txnType}</TxnType>
  <UserCode>${userCode}</UserCode>
  <UserPass>${userPass}</UserPass>
  <SecureType>${secureType}</SecureType>
  <Pan>${pan}</Pan>
  <Expiry>${expiry}</Expiry>
  <Cvv2>${cvv2}</Cvv2>
  <OkUrl>${okUrl}</OkUrl>
  <FailUrl>${failUrl}</FailUrl>
  <Hash>${hash}</Hash>
  <Rnd>${rnd}</Rnd>
  <Lang>${lang}</Lang>
</PayforRequest>`;

  const response = await axios.post(
    'https://vpos.qnb.com.tr/Gateway/XMLGate.aspx',
    xml,
    { headers: { 'Content-Type': 'text/xml' } }
  );
  return response.data;
}
// ...existing code...
          success: false,
          message: parsed?.GVPSResponse?.ReasonCode || 'Banka yanıtı alınamadı'
        };
      }
    } else if (typeof response.data === 'object') {
      // Yanıt doğrudan JSON ise
      console.log('QNB XML yanıtı (object):', JSON.stringify(response.data).substring(0, 500));
      const pr = response.data.PaymentRequest || response.data;
      return {
        success: false,
        error: pr.ErrMsg || pr.Message || 'Banka JSON hata yanıtı',
        errorCode: pr.ProcReturnCode || undefined
      };
    } else {
      // Beklenmeyen format
      return {
        success: false,
        message: 'Banka yanıtı beklenmeyen formatta'
      };
    }
  } catch (err: any) {
    // XML parse hatası veya banka yanıtı XML değilse
    console.error('QNB ödeme isteği hatası:', err);
    if (typeof err === 'object' && err !== null && 'response' in err && err.response && 'data' in err.response) {
      if (typeof err.response.data === 'string') {
        console.error('QNB response data (ilk 500):', err.response.data.substring(0, 500));
      } else {
        console.error('QNB response data (object):', JSON.stringify(err.response.data).substring(0, 500));
      }
    }
    throw new Error('QNB ödeme isteği başarısız veya yanıt hatalı.');
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

