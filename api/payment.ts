import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 3D doğrulama sonrası Payfor3DModelPayment.xml akışı
export async function sendQNB3DModelPayment({
  requestGuid,
  userCode,
  userPass,
  orderId
}: {
  requestGuid: string;
  userCode: string;
  userPass: string;
  orderId: string;
}) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PayforRequest>
  <RequestGuid>${requestGuid}</RequestGuid>
  <UserCode>${userCode}</UserCode>
  <UserPass>${userPass}</UserPass>
  <OrderId>${orderId}</OrderId>
  <SecureType>3DModelPayment</SecureType>
</PayforRequest>`;
  console.log('QNB 3DModelPayment gönderilen XML:', xml);
  const response = await axios.post(
    'https://vpos.qnb.com.tr/Gateway/XMLGate.aspx',
    xml,
    { headers: { 'Content-Type': 'text/xml' } }
  );
  console.log('QNB 3DModelPayment yanıtı:', response.data);
  return response.data;
}

// Banka örneğine tam uyumlu 3D ödeme fonksiyonu
export async function sendQNB3DPayment({
  amount,
  currency,
  orderId,
  installmentCount,
  txnType,
  pan,
  expiry,
  cvv2,
  okUrl,
  failUrl,
  lang,
  cardHolderName
}: {
  amount: string;
  currency: string;
  orderId: string;
  installmentCount: string;
  txnType: string;
  pan: string;
  expiry: string;
  cvv2: string;
  okUrl: string;
  failUrl: string;
  lang: string;
  cardHolderName: string;
}) {
  // QNB API gereği: MbrId her zaman 5, MerchantID sabit, endpoint Default.aspx, amount kuruşlu formatta
  const mbrId = '5';
  const merchantId = '106600000017400';
  const userCode = process.env.VITE_QNB_USER_CODE || '';
  const userPass = process.env.VITE_QNB_USER_PASS || '';
  const secureType = '3D';
  const rnd = Math.random().toString();
  // PurchAmount kuruşlu formatta olmalı (örn: 1.00)
  const formattedAmount = Number(amount).toFixed(2);
  // Hash algoritması: OrderId + MerchantId + Amount + OkUrl + FailUrl + UserCode + Rnd + UserPass
  const hashStr = orderId + merchantId + formattedAmount + okUrl + failUrl + userCode + rnd + userPass;
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PayforRequest>
  <MbrId>${mbrId}</MbrId>
  <MerchantID>${merchantId}</MerchantID>
  <UserCode>${userCode}</UserCode>
  <UserPass>${userPass}</UserPass>
  <SecureType>${secureType}</SecureType>
  <TxnType>${txnType}</TxnType>
  <InstallmentCount>${installmentCount}</InstallmentCount>
  <Currency>${currency}</Currency>
  <CardHolderName>${cardHolderName}</CardHolderName>
  <Pan>${pan}</Pan>
  <Expiry>${expiry}</Expiry>
  <Cvv2>${cvv2}</Cvv2>
  <OkUrl>${okUrl}</OkUrl>
  <FailUrl>${failUrl}</FailUrl>
  <OrderId>${orderId}</OrderId>
  <PurchAmount>${formattedAmount}</PurchAmount>
  <Lang>${lang}</Lang>
  <Rnd>${rnd}</Rnd>
  <Hash>${hash}</Hash>
</PayforRequest>`;

  console.log('QNB 3DPayment gönderilen XML:', xml);
  const response = await axios.post(
    'https://vpos.qnb.com.tr/Gateway/Default.aspx',
    xml,
    { headers: { 'Content-Type': 'text/xml' } }
  );
  console.log('QNB 3DPayment yanıtı:', response.data);
  return response.data;
}

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST isteği desteklenmektedir.' });
  }
  try {
    const {
      amount, currency, orderId, installmentCount,
      txnType, pan, expiry, cvv2,
      okUrl, failUrl, lang, cardHolderName, requestGuid, is3DCallback
    } = req.body;

  // SecureType parametresini asla dışarıdan alma, her zaman '3D' olarak gönder

    if (is3DCallback) {
  // 3D doğrulama sonrası ikinci adım (Payfor3DModelPayment.xml)
      const result = await sendQNB3DModelPayment({
        requestGuid,
        userCode: process.env.VITE_QNB_USER_CODE || '',
        userPass: process.env.VITE_QNB_USER_PASS || '',
        orderId,
      });
  console.log('API handler 3DModelPayment yanıtı:', result);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(result);
    } else {
  // İlk adım: 3D başlatma
      const result = await sendQNB3DPayment({
        amount, currency, orderId, installmentCount,
        txnType, pan, expiry, cvv2, okUrl, failUrl, lang, cardHolderName
      });
  console.log('API handler 3DPayment yanıtı:', result);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(result);
    }
  } catch (err: any) {
    console.error('QNB ödeme API hatası:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Sunucu tarafında bir hata oluştu.' });
  }
}
