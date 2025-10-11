import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { to, name, reservationId, driverName, driverContact, driverPlate } = req.body;

  if (!to || !driverName || !driverContact || !driverPlate) {
    return res.status(400).json({ detail: 'Eksik bilgi: e-posta, sürücü adı, iletişim ve plaka zorunlu.' });
  }

  // Mail transporter (gerekirse kendi SMTP bilgilerinizi girin)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = 'Sürücü Bilgileriniz';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Sayın ${name || ''},</h2>
      <p>Rezervasyonunuz için sürücü bilgileriniz aşağıdadır:</p>
      <ul style="font-size: 16px;">
        <li><b>Sürücü Adı:</b> ${driverName}</li>
        <li><b>Sürücü İletişim:</b> ${driverContact}</li>
        <li><b>Plaka:</b> ${driverPlate}</li>
      </ul>
      <p>Güvenli ve keyifli yolculuklar dileriz.</p>
      <p style="font-size:13px;color:#888;">Rezervasyon No: ${reservationId || ''}</p>
      <br />
      <p style="font-size:13px;color:#888;">Bu e-posta otomatik olarak gönderilmiştir.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ detail: 'Mail gönderilemedi', error: err.message });
  }
}
