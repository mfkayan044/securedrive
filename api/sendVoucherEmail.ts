// api/sendVoucherEmail.ts
// Basit bir Node.js/Express API fonksiyonu örneği (SendGrid ile)
// Gerçek projede .env ile gizli anahtarlarınızı yönetin!


import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, name, voucherCode, reservationDetails } = req.body;
  if (!to || !voucherCode) {
    return res.status(400).json({ error: 'Eksik parametre' });
  }

  // Zoho SMTP ayarları
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.ZOHO_USER || 'ZOHO_MAIL_ADRESINIZ',
      pass: process.env.ZOHO_PASS || 'ZOHO_UYGULAMA_SIFRESI',
    },
  });

  const mailOptions = {
    from: process.env.ZOHO_USER || 'ZOHO_MAIL_ADRESINIZ',
    to,
    subject: 'Voucher Bilgilendirmesi',
    html: `
      <h2>Sayın ${name || ''},</h2>
      <p>Rezervasyonunuz için voucher kodunuz: <b>${voucherCode}</b></p>
      <p>Rezervasyon Detayları:</p>
      <pre>${reservationDetails || ''}</pre>
      <p>İyi yolculuklar dileriz.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Mail gönderilemedi', detail: error.message });
  }
}
