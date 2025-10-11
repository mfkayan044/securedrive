import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { to, name, reservationId, driverName, driverContact, driverPlate } = req.body;

  if (!to || !driverName || !driverContact || !driverPlate) {
    return res.status(400).json({ detail: 'Eksik bilgi: e-posta, sürücü adı, iletişim ve plaka zorunlu.' });
  }

  // Brevo (Sendinblue) ile aynı SMTP yapılandırması
  if (!process.env.SIB_USER || !process.env.SIB_PASS) {
    return res.status(500).json({ detail: 'Mail gönderim ayarları eksik (SIB_USER/SIB_PASS).' });
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SIB_USER,
      pass: process.env.SIB_PASS,
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
      from: 'operasyon@securedrive.org',
      to,
      subject,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sendDriverInfo API error:', err);
    return res.status(500).json({ detail: 'Mail gönderilemedi', error: err && err.message ? err.message : String(err) });
  }
}
