import { initiate3DPayment, QNBPaymentRequest } from './qnb-payment.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Zorunlu alanları kontrol et
    if (!orderId || !amount || !cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      return res.status(400).json({ 
        error: 'Eksik ödeme bilgileri',
        missing: 'orderId, amount, cardNumber, cardExpiry, cardCvv, cardHolder gerekli'
      });
    }

    // Return URL'leri oluştur
    const baseUrl = req.headers.origin || `https://${req.headers.host}`;
    const returnUrl = `${baseUrl}/payment-success`;
    const errorUrl = `${baseUrl}/payment-error`;

    // Ödeme isteği hazırla
    const paymentRequest: QNBPaymentRequest = {
      orderId,
      amount: Math.round(amount * 100), // TL'yi kuruşa çevir
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

    // QNB Bank 3D Secure başlat
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
        error: result.message,
        errorCode: result.errorCode
      });
    }

  } catch (error) {
    console.error('Payment API Error:', error);
    return res.status(500).json({ 
      error: 'Ödeme işlemi sırasında beklenmeyen bir hata oluştu',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}
