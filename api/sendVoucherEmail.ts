  console.log('SIB_USER:', process.env.SIB_USER, 'SIB_PASS:', !!process.env.SIB_PASS);
// /api/sendVoucherEmail.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Sadece POST isteği destekleniyor.' });
    }

    const { to, name, voucherCode, reservationDetails } = req.body;

    // reservationDetails string gelirse parse et
    let details = reservationDetails;
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch {}
    }

    if (!to || !voucherCode) {
      return res.status(400).json({ error: 'Eksik parametre: "to" ve "voucherCode" zorunludur.' });
    }

    if (!process.env.SIB_USER || !process.env.SIB_PASS) {
      return res.status(500).json({ error: 'Mail gönderim ayarları eksik.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.SIB_USER,
        pass: process.env.SIB_PASS,
      },
    });

    const mailOptions = {
      from: 'operasyon@securedrive.org',
      to,
      subject: 'Voucher Bilgilendirmesi',
      html: `
        <h2>Sayın ${name || ''},</h2>
        <p>Rezervasyonunuz için voucher kodunuz: <b>${voucherCode}</b></p>
        <h3>Rezervasyon Detayları:</h3>
        <ul>
          <li><b>Transfer Türü:</b> ${details?.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'}</li>
          <li><b>Alış Tarihi:</b> ${details?.departure_date || '-'} - ${details?.departure_time || '-'}</li>
          <li><b>Dönüş Tarihi:</b> ${details?.return_date || '-'} - ${details?.return_time || '-'}</li>
          <li><b>Yolcu Adı:</b> ${details?.customer_name || '-'}</li>
          <li><b>Telefon:</b> ${details?.customer_phone || '-'}</li>
          <li><b>Yolcu Sayısı:</b> ${details?.passengers || '-'}</li>
          <li><b>Toplam Tutar:</b> ${details?.total_price || '-'} ₺</li>
          <li><b>Gidiş Uçuş Kodu:</b> ${details?.departure_flight_code || '-'}</li>
          <li><b>Dönüş Uçuş Kodu:</b> ${details?.return_flight_code || '-'}</li>
        </ul>
        <p>İyi yolculuklar dileriz.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, info });
  } catch (error: any) {
    return res.status(500).json({ error: 'Mail gönderilemedi', detail: error?.message || String(error) });
  }
}
