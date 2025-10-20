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

    // Rezervasyon detaylarını parse et
    let details: any = {};
    try {
      details = typeof reservationDetails === 'string' ? JSON.parse(reservationDetails) : reservationDetails;
    } catch (e) {
      details = {};
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
      subject: '✅ Rezervasyonunuz Onaylandı - Secure Drive Transfer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Secure Drive Transfer</h1>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #10b981; margin-top: 0;">✓ Rezervasyonunuz Onaylandı!</h2>
            <p>Sayın <strong>${name || 'Değerli Müşterimiz'}</strong>,</p>
            <p>Transfer rezervasyonunuz başarıyla oluşturulmuştur.</p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #374151;">Rezervasyon Bilgileri</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Rezervasyon No:</strong></td>
                  <td style="padding: 8px 0; color: #10b981; font-weight: bold;">${voucherCode}</td>
                </tr>
                ${details.from ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Nereden:</strong></td>
                  <td style="padding: 8px 0;">${details.from}</td>
                </tr>
                ` : ''}
                ${details.to ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Nereye:</strong></td>
                  <td style="padding: 8px 0;">${details.to}</td>
                </tr>
                ` : ''}
                ${details.vehicle ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Araç Tipi:</strong></td>
                  <td style="padding: 8px 0;">${details.vehicle}</td>
                </tr>
                ` : ''}
                ${details.date ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Tarih:</strong></td>
                  <td style="padding: 8px 0;">${details.date}</td>
                </tr>
                ` : ''}
                ${details.time ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Saat:</strong></td>
                  <td style="padding: 8px 0;">${details.time}</td>
                </tr>
                ` : ''}
                ${details.passengers ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Yolcu Sayısı:</strong></td>
                  <td style="padding: 8px 0;">${details.passengers} kişi</td>
                </tr>
                ` : ''}
                ${details.price ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Toplam Tutar:</strong></td>
                  <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: bold;">${details.price} TL</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;">
                <strong>📞 İletişim:</strong> Transfer saatinden önce sizinle iletişime geçilecektir.<br>
                <strong>✉️ Sorularınız için:</strong> operasyon@securedrive.org
              </p>
            </div>

            <p>İyi yolculuklar dileriz!</p>
          </div>

          <div style="background-color: #374151; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px;">Secure Drive Transfer</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">www.securedrive.org</p>
          </div>
        </div>
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
