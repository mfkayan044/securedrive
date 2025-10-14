import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto';

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const {
      mbrId, merchantId, amount, currency, orderId, installmentCount,
      txnType, userCode, userPass, secureType, pan, expiry, cvv2,
      okUrl, failUrl, lang
    } = req.body;

    const result = await sendQNB3DPayment({
      mbrId, merchantId, amount, currency, orderId, installmentCount,
      txnType, userCode, userPass, secureType, pan, expiry, cvv2,
      okUrl, failUrl, lang
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error('QNB ödeme API error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Sunucu hatası' });
  }
}

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

