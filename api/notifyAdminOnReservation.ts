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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🚗 Yeni Transfer Rezervasyonu</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Müşteri Bilgileri</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 4px 0;"><b>Ad Soyad:</b> ${reservation.customer_name || '-'}</li>
            <li style="padding: 4px 0;"><b>E-posta:</b> ${reservation.customer_email || '-'}</li>
            <li style="padding: 4px 0;"><b>Telefon:</b> ${reservation.customer_phone || '-'}</li>
          </ul>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Transfer Detayları</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 4px 0;"><b>Güzergah:</b> ${reservation.from_location_name || '-'} → ${reservation.to_location_name || '-'}</li>
            <li style="padding: 4px 0;"><b>Araç Tipi:</b> ${reservation.vehicle_type_name || '-'}</li>
            <li style="padding: 4px 0;"><b>Tarih:</b> ${reservation.departure_date || '-'}</li>
            <li style="padding: 4px 0;"><b>Saat:</b> ${reservation.departure_time || '-'}</li>
            <li style="padding: 4px 0;"><b>Yolcu Sayısı:</b> ${reservation.passengers || '-'}</li>
            <li style="padding: 4px 0;"><b>Toplam Fiyat:</b> <span style="color: #10b981; font-weight: bold;">${reservation.total_price || '-'} TL</span></li>
          </ul>
        </div>

        ${reservation.notes ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Özel Notlar</h3>
          <p>${reservation.notes}</p>
        </div>
        ` : ''}

        <p style="color: #6b7280; font-size: 14px;">Admin panelinden detayları görüntüleyebilirsiniz.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Admin maili gönderilemedi', detail: error?.message || String(error) });
  }
}
