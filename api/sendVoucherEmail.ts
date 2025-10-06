// /api/sendVoucherEmail.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('sendVoucherEmail fonksiyonu çağrıldı');
  try {
    if (req.method !== 'POST') {
      console.log('Geçersiz method:', req.method);
      return res.status(405).json({ error: 'Sadece POST isteği destekleniyor.' });
    }

    const { to, name, voucherCode, reservationDetails } = req.body;
    console.log('Gelen body:', req.body);

    if (!to || !voucherCode) {
      console.log('Eksik parametre:', { to, voucherCode });
      return res.status(400).json({ error: 'Eksik parametre: "to" ve "voucherCode" zorunludur.' });
    }

    if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
      console.log('Environment değişkenleri eksik');
      return res.status(500).json({ error: 'Mail gönderim ayarları eksik. Lütfen yöneticinize başvurun.' });
    }

    // Zoho SMTP ayarları
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    const mailOptions = {
      from: process.env.ZOHO_USER,
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

    const info = await transporter.sendMail(mailOptions);
    console.log('Mail gönderildi:', info);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Mail gönderme hatası:', error);
    // Her durumda JSON dön
    return res.status(500).json({ error: 'Mail gönderilemedi', detail: error?.message || String(error) });
  }
}
