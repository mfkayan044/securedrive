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
  cardHolderName,
  requestGuid
}: {
  amount: string;
  currency?: string;
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
  requestGuid?: string;
}) {
  // QNB API gereği: MbrId her zaman 5, MerchantID sabit, endpoint Default.aspx, amount kuruşlu formatta
  const mbrId = '5';
  const merchantId = '106600000017400';
  const userCode = process.env.VITE_QNB_USER_CODE || '';
  const userPass = process.env.VITE_QNB_USER_PASS || '';
  const secureType = '3D';
  const rnd = Math.random().toString();
  // Para birimi zorunlu olarak 949 (TRY) gönderilecek
  const currencyCode = currency && currency !== '0' ? currency : '949';
  // PurchAmount kuruşlu formatta olmalı (örn: 1.00)
  const formattedAmount = Number(amount).toFixed(2);
  // Her işlem için benzersiz bir requestGuid kullan (yoksa üret)
  const guid = requestGuid || (crypto.randomUUID ? crypto.randomUUID() : rnd);
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
  <Currency>${currencyCode}</Currency>
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
  <RequestGuid>${guid}</RequestGuid>
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
  // Gelen body'yi logla
  console.log('Gelen ödeme isteği body:', req.body);
  try {
    // Frontend'den gelen alanları QNB'nin beklediği parametrelere map'le
    const body = req.body || {};
    // OkUrl ve FailUrl zorunlu olarak frontend'den veya .env'den gelmeli, yoksa hata döndür
    const okUrl = body.okUrl || process.env.VITE_QNB_OK_URL;
    const failUrl = body.failUrl || process.env.VITE_QNB_FAIL_URL;
    if (!okUrl || !failUrl) {
      return res.status(400).json({ error: 'OkUrl ve FailUrl zorunludur. Lütfen gerçek yönlendirme adreslerinizi belirtin.' });
    }
    const mapped = {
      amount: body.amount,
      currency: body.currency || '949',
      orderId: body.orderId,
      installmentCount: body.installmentCount || '0',
      txnType: body.txnType || 'Auth',
      pan: body.pan || body.cardNumber,
      expiry: body.expiry || body.cardExpiry,
      cvv2: body.cvv2 || body.cardCvv,
      okUrl,
      failUrl,
      lang: body.lang || 'tr',
      cardHolderName: body.cardHolderName || body.cardHolder,
      requestGuid: body.requestGuid || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
      is3DCallback: body.is3DCallback
    };

    // SecureType parametresini asla dışarıdan alma, her zaman '3D' olarak gönder

    if (mapped.is3DCallback) {
      // 3D doğrulama sonrası ikinci adım (Payfor3DModelPayment.xml)
      const result = await sendQNB3DModelPayment({
        requestGuid: mapped.requestGuid,
        userCode: process.env.VITE_QNB_USER_CODE || '',
        userPass: process.env.VITE_QNB_USER_PASS || '',
        orderId: mapped.orderId,
      });
      console.log('API handler 3DModelPayment yanıtı:', result);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(result);
    } else {
      // İlk adım: 3D başlatma
      const result = await sendQNB3DPayment({
        amount: mapped.amount,
        currency: mapped.currency,
        orderId: mapped.orderId,
        installmentCount: mapped.installmentCount,
        txnType: mapped.txnType,
        pan: mapped.pan,
        expiry: mapped.expiry,
        cvv2: mapped.cvv2,
        okUrl: mapped.okUrl,
        failUrl: mapped.failUrl,
        lang: mapped.lang,
        cardHolderName: mapped.cardHolderName,
        requestGuid: mapped.requestGuid
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
