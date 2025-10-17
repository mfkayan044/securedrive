import axios from 'axios';
// import type { NextApiRequest, NextApiResponse } from 'next';
import * as crypto from 'crypto';

// QNB yanıtındaki ResponseHash doğrulama fonksiyonu
// Algoritma: Base64(SHA1(OrderId + ResponseRnd + UserPass))
export function verifyQNBResponseHash(params: {
  OrderId: string;
  ResponseRnd: string;
  UserPass: string;
  ResponseHash: string;
}): boolean {
  const { OrderId, ResponseRnd, UserPass, ResponseHash } = params;
  const hashString = `${OrderId}${ResponseRnd}${UserPass}`;
  const sha1 = crypto.createHash('sha1').update(hashString, 'utf8').digest();
  const base64Hash = Buffer.from(sha1).toString('base64');
  return base64Hash === ResponseHash;
}

// QNB ResponseHash doğrulama test bloğu
if (require.main === module) {
  const testResult = verifyQNBResponseHash({
    OrderId: 'RES_1760715082613',
    ResponseRnd: 'PF638963230703894617',
    UserPass: 'g42rG',
    ResponseHash: 'H0KaLNqKMq4mTxPqUAXEZwjJXKpGYaeOk8rkQMYVzJE='
  });
  console.log('QNB ResponseHash doğrulama sonucu:', testResult);
}


// Banka örneğine tam uyumlu 3D ödeme fonksiyonu
export async function sendQNB3DPayment({
  amount,
  currency,
  mrcOrderId,
  installmentCount,
  txnType,
  pan,
  expiry,
  cvv2,
  okUrl,
  failUrl,
  lang,
  cardHolderName,
  requestGuid
}: {
  amount: string;
  currency?: string;
  mrcOrderId: string;
  installmentCount: string;
  txnType: string;
  pan: string;
  expiry: string;
  cvv2: string;
  okUrl: string;
  failUrl: string;
  lang: string;
  cardHolderName: string;
  requestGuid?: string;
}) {
  // QNB API gereği: MbrId her zaman 5, MerchantID sabit, endpoint Default.aspx, amount kuruşlu formatta
  // ENV ve parametre kontrol logları
  console.log('QNB ENV kontrol:', {
    VITE_QNB_USER_CODE: process.env.VITE_QNB_USER_CODE,
    VITE_QNB_USER_PASS: process.env.VITE_QNB_USER_PASS,
    VITE_QNB_MERCHANT_ID: process.env.VITE_QNB_MERCHANT_ID,
    VITE_QNB_ENVIRONMENT: process.env.VITE_QNB_ENVIRONMENT,
    endpoint: 'https://vpos.qnb.com.tr/Gateway/JsonGate.aspx',
  });
  const mbrId = '5';
  const merchantId = process.env.VITE_QNB_MERCHANT_ID || process.env.QNB_MERCHANT_ID || '106600000017400';
  const userCode = process.env.VITE_QNB_USER_CODE || process.env.QNB_USER_CODE || '';
  const merchantPass = process.env.VITE_QNB_MERCHANT_PASS || process.env.QNB_MERCHANT_PASS || '29222247';
  const secureType = '3DPay';
  const rnd = String(Math.random());
  const currencyCode = currency && currency !== '0' ? String(currency) : '949';
  const formattedAmount = Number(amount).toFixed(2);
  const guid = requestGuid || (crypto.randomUUID ? crypto.randomUUID() : rnd);
  // Hash string: MbrId + MrcOrderId + PurchAmount + OkUrl + FailUrl + TxnType + InstallmentCount + Rnd + MerchantPass
  const hashStr = String(mbrId) + String(mrcOrderId) + String(formattedAmount) + String(okUrl) + String(failUrl) + String(txnType) + String(installmentCount) + String(rnd) + String(merchantPass);
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');
  console.log('QNB hash string:', hashStr);

  // JSON body oluşturuluyor (UserPass eklenmiyor!)
  const jsonBody = {
    MbrId: String(mbrId),
    MerchantID: String(merchantId),
    UserCode: String(userCode),
    SecureType: String(secureType),
    TxnType: String(txnType),
    InstallmentCount: String(installmentCount),
    Currency: String(currencyCode),
    CardHolderName: String(cardHolderName),
    Pan: String(pan),
    Expiry: String(expiry),
    Cvv2: String(cvv2),
    OkUrl: String(okUrl),
    FailUrl: String(failUrl),
    MrcOrderId: String(mrcOrderId),
    PurchAmount: String(formattedAmount),
    Lang: 'TR',
    Rnd: String(rnd),
    RequestGuid: String(guid),
  MerchantPass: String(merchantPass),
    Hash: String(hash)
  };
  console.log('QNB 3DPayment gönderilen JSON:', jsonBody);
  try {
    const response = await axios.post(
      'https://vpos.qnb.com.tr/Gateway/JsonGate.aspx',
      jsonBody,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('QNB 3DPayment yanıtı:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response.data;
  } catch (error) {
    const axiosError = error as import('axios').AxiosError;
    if (axiosError.response) {
      console.error('QNB 3DPayment hata yanıtı:', {
        status: axiosError.response.status,
        headers: axiosError.response.headers,
        data: axiosError.response.data
      });
      return axiosError.response.data;
    } else {
      console.error('QNB 3DPayment hata:', axiosError.message);
      throw error;
    }
  }
}