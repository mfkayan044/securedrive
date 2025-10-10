  console.log('SIB_USER:', process.env.SIB_USER, 'SIB_PASS:', !!process.env.SIB_PASS);
// /api/sendVoucherEmail.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import path from 'path';
import { PassThrough } from 'stream';

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


    // PDF oluştur
  // PDFKit'in tip hatalarını aşmak için doc'u any olarak tanımla
  const doc: any = new PDFDocument({ size: 'A4', margin: 40 });
  // Türkçe karakter desteği için Roboto fontlarını yükle
  doc.registerFont('roboto', path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'));
  doc.registerFont('roboto-bold', path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'));
    const pdfStream = new PassThrough();
    let pdfBuffer: Buffer | null = null;
    const chunks: Buffer[] = [];



    // Detay satırlarını PDF işlemlerinden önce tanımla
    const detailRows = [
      ['Ad Soyad', details?.customer_name || '-'],
      ['E-posta', details?.customer_email || '-'],
      ['Telefon', details?.customer_phone || '-'],
      ['Güzergah', (details?.from_location_name && details?.to_location_name) ? `${details.from_location_name} → ${details.to_location_name}` : '-'],
      ['Transfer Türü', details?.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'],
      ['Gidiş Tarihi', `${details?.departure_date || '-'} - ${details?.departure_time || '-'}`],
      ['Dönüş Tarihi', `${details?.return_date || '-'} - ${details?.return_time || '-'}`],
      ['Gidiş Uçuş Kodu', details?.departure_flight_code || '-'],
      ['Dönüş Uçuş Kodu', details?.return_flight_code || '-'],
      ['Yolcu Sayısı', details?.passengers || '-'],
      ['Yolcu İsimleri', Array.isArray(details?.passenger_names) ? details.passenger_names.join(', ') : (details?.passenger_names || '-')],
      ['Araç Seçimi', details?.vehicle_type_name || '-'],
      ['Ek Hizmetler', Array.isArray(details?.extra_services) ? details.extra_services.join(', ') : (details?.extra_services || '-')],
      ['Ödeme Durumu', details?.payment_status || '-'],
      ['Notlar', details?.notes || '-'],
    ];



    doc.pipe(pdfStream);


    // LOGO sağ üst köşe
    try {
      const logoWidth = 90;
      const logoHeight = 40;
      doc.image('logo/logo.png', doc.page.width - logoWidth - 40, 32, { width: logoWidth, height: logoHeight });
    } catch (e) {
      // logo yoksa devam et
    }
    doc.moveDown();

    // Başlık
    doc
      .font('roboto-bold')
      .fontSize(26)
      .fillColor('#b71c1c')
      .text('VOUCHER', { align: 'center' });
    doc.moveDown();

    // Alt başlık kutusu
    doc
      .rect(40, 120, doc.page.width - 80, 40)
      .fillAndStroke('#f5f5f5', '#bdbdbd')
      .fillColor('#333')
      .font('roboto-bold')
      .fontSize(16)
      .text(`Sayın ${name || ''}`, 0, 132, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown();


    // Voucher kodu kutusu (daha büyük ve ortalanmış)
    doc
      .rect(40, 180, doc.page.width - 80, 50)
      .fillAndStroke('#ffcdd2', '#b71c1c')
      .fillColor('#b71c1c')
      .font('roboto-bold')
      .fontSize(22)
      .text(`Voucher Kodunuz: ${voucherCode}`, 0, 195, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown(1.5);

    // Detay başlığı
    doc
      .font('roboto-bold')
      .fontSize(17)
      .fillColor('#b71c1c')
      .text('Rezervasyon Detayları', 0, 245, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown(0.5);

    // Detay kutuları: modern, iki sütunlu, paddingli
    let y = 275;
    const rowHeight = 34;
    const labelWidth = 160;
    const valueWidth = doc.page.width - 120 - labelWidth;
  (detailRows as [string, string][]).forEach(([label, value]: [string, string]) => {
      // Kutu
      doc
        .rect(60, y, doc.page.width - 120, rowHeight)
        .fillAndStroke('#f5f5f5', '#bdbdbd');
      // Label
      doc
        .fillColor('#b71c1c')
        .font('roboto-bold')
        .fontSize(13)
        .text(label + ':', 70, y + 10, { width: labelWidth - 10, align: 'left', continued: false });
      // Value
      doc
        .fillColor('#222')
        .font('roboto')
        .fontSize(13)
        .text(value, 70 + labelWidth, y + 10, { width: valueWidth - 20, align: 'left', continued: false });
      y += rowHeight + 4;
    });

    // Alt gri kutu ve iletişim
    doc
      .rect(0, doc.page.height - 80, doc.page.width, 80)
      .fill('#eeeeee');
    doc
      .fillColor('#b71c1c')
      .font('roboto-bold')
      .fontSize(12)
      .text('İyi yolculuklar dileriz.', 0, doc.page.height - 60, { align: 'center', width: doc.page.width });
    doc
      .fillColor('#757575')
      .font('roboto')
      .fontSize(10)
      .text('www.securedrive.org  |  operasyon@securedrive.org', 0, doc.page.height - 40, { align: 'center', width: doc.page.width });






    doc.end();

    // PDF stream to buffer (tek pipe, yukarıda)
    await new Promise<void>((resolve, reject) => {
      pdfStream.on('data', (chunk) => chunks.push(chunk));
      pdfStream.on('end', () => {
        pdfBuffer = Buffer.concat(chunks);
        resolve();
      });
      pdfStream.on('error', reject);
    });

    if (!pdfBuffer) {
      console.error('PDF oluşturulamadı, buffer null');
      return res.status(500).json({ error: 'PDF oluşturulamadı' });
    }

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
      attachments: [
        {
          filename: `voucher_${voucherCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, info });
    } catch (mailError: any) {
      console.error('Mail gönderilemedi:', mailError);
      return res.status(500).json({ error: 'Mail gönderilemedi', detail: mailError?.message || String(mailError) });
    }
  } catch (error: any) {
    console.error('Genel hata:', error);
    return res.status(500).json({ error: 'Mail gönderilemedi', detail: error?.message || String(error) });
  }
}
