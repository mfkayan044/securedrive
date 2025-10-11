import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { to, name } = req.body;
  if (!to) {
    return res.status(400).json({ detail: 'E-posta adresi zorunlu.' });
  }

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

  const subject = 'Kayıt Başarılı - SecureDrive';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Hoş geldiniz${name ? ', ' + name : ''}!</h2>
      <p>SecureDrive ailesine katıldığınız için teşekkür ederiz.</p>
      <p>Artık kolayca rezervasyon oluşturabilir, geçmiş işlemlerinizi takip edebilirsiniz.</p>
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
    console.error('sendWelcomeMail API error:', err);
    return res.status(500).json({ detail: 'Mail gönderilemedi', error: err && err.message ? err.message : String(err) });
  }
}
