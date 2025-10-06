import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    console.log('YANIT: Sadece POST isteği destekleniyor.');
    return res.status(405).json({ error: 'Sadece POST isteği destekleniyor.' });
  }

  const { reservation } = req.body;
  if (!reservation) {
    console.log('YANIT: Rezervasyon bilgisi eksik.');
    return res.status(400).json({ error: 'Rezervasyon bilgisi eksik.' });
  }

  // Admin e-posta adresi
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.log('YANIT: Admin e-posta adresi tanımlı değil.', process.env.ADMIN_NOTIFICATION_EMAIL);
    return res.status(500).json({ error: 'Admin e-posta adresi tanımlı değil.' });
  }

  // SMTP ayarları (Sendinblue/Brevo)
  console.log('SMTP Ayarları:', process.env.SIB_USER, !!process.env.SIB_PASS);
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
    const info = await transporter.sendMail(mailOptions);
    console.log('YANIT: Mail gönderildi:', info);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('YANIT: Admin maili gönderilemedi', error);
    return res.status(500).json({ error: 'Admin maili gönderilemedi', detail: error?.message || String(error) });
  }
}
