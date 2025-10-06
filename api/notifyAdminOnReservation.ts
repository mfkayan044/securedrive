import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği destekleniyor.' });
  }

  const { reservation } = req.body;
  if (!reservation) {
    return res.status(400).json({ error: 'Rezervasyon bilgisi eksik.' });
  }

  // Admin e-posta adresi
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    return res.status(500).json({ error: 'Admin e-posta adresi tanımlı değil.' });
  }

  // SMTP ayarları (Sendinblue/Brevo)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SIB_USER,
      pass: process.env.SIB_PASS,
    },
  });

  const mailOptions = {
    from: 'operasyon@securedrive.org',
    to: adminEmail,
    subject: 'Yeni Transfer Rezervasyonu',
    html: `
      <h2>Yeni Transfer Rezervasyonu</h2>
      <ul>
        <li><b>Ad Soyad:</b> ${reservation.customer_name || '-'}</li>
        <li><b>E-posta:</b> ${reservation.customer_email || '-'}</li>
        <li><b>Telefon:</b> ${reservation.customer_phone || '-'}</li>
        <li><b>Güzergah:</b> ${reservation.from_location_name || '-'} → ${reservation.to_location_name || '-'}</li>
        <li><b>Tarih:</b> ${reservation.departure_date || '-'} - ${reservation.departure_time || '-'}</li>
        <li><b>Notlar:</b> ${reservation.notes || '-'}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Admin maili gönderilemedi', detail: error?.message || String(error) });
  }
}
