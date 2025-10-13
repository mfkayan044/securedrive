import { verify3DPayment } from './qnb-payment.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Payment callback received:', req.body);

    // QNB Bank'tan gelen 3D Secure sonucunu doğrula
    const verificationResult = await verify3DPayment(req.body);

    if (verificationResult.success) {
      // Ödeme başarılı - Supabase'de rezervasyon durumunu güncelle
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

      // Başarılı ödeme sayfasına yönlendir
      return res.redirect(302, `/payment-success?orderId=${orderId}&transactionId=${transactionId}`);

    } else {
      // Ödeme başarısız
      console.log('Payment failed:', verificationResult);
      
      // Hata sayfasına yönlendir
      return res.redirect(302, `/payment-error?error=${encodeURIComponent(verificationResult.message)}&orderId=${verificationResult.orderId}`);
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return res.redirect(302, `/payment-error?error=${encodeURIComponent('Ödeme doğrulama sırasında hata oluştu')}`);
  }
}
