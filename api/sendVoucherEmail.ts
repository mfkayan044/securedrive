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
      [
        'Güzergah',
        (details?.from_location_name && details?.to_location_name)
          ? `${details.from_location_name} → ${details.to_location_name}`
          : (details?.from_location || details?.from || '-') + ' → ' + (details?.to_location || details?.to || '-')
      ],
      ['Transfer Türü', details?.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'],
      ['Gidiş Tarihi', `${details?.departure_date || '-'} - ${details?.departure_time || '-'}`],
      ['Dönüş Tarihi', `${details?.return_date || '-'} - ${details?.return_time || '-'}`],
      ['Gidiş Uçuş Kodu', details?.departure_flight_code || '-'],
      ['Dönüş Uçuş Kodu', details?.return_flight_code || '-'],
      ['Yolcu Sayısı', details?.passengers || '-'],
      ['Yolcu İsimleri', Array.isArray(details?.passenger_names) ? details.passenger_names.join(', ') : (details?.passenger_names || '-')],
      [
        'Araç Seçimi',
        details?.vehicle_type_name || details?.vehicle_type || details?.vehicle || '-'
      ],
      ['Ek Hizmetler', Array.isArray(details?.extra_services) ? details.extra_services.join(', ') : (details?.extra_services || '-')],
      ['Ödeme Durumu', details?.payment_status || '-'],
      ['Notlar', details?.notes || '-'],
    ];



    doc.pipe(pdfStream);



    // LOGO sol üst köşe
    try {
      const logoWidth = 80;
      const logoHeight = 36;
      doc.image('logo/logo.png', 40, 32, { width: logoWidth, height: logoHeight });
    } catch (e) {
      // logo yoksa devam et
    }
    // Başlık ve voucher kodu kutusu sağda
    const reservationNo = details?.reservation_number || details?.id || voucherCode;
    doc
      .rect(doc.page.width - 240, 32, 200, 36)
      .fillAndStroke('#ffcdd2', '#b71c1c')
      .fillColor('#b71c1c')
      .font('roboto-bold')
      .fontSize(15)
      .text('Rezervasyon No:', doc.page.width - 230, 42, { width: 90, align: 'left' })
      .fontSize(18)
      .text(reservationNo, doc.page.width - 140, 40, { width: 90, align: 'right' });

    // Başlık
    doc
      .font('roboto-bold')
      .fontSize(24)
      .fillColor('#b71c1c')
      .text('VOUCHER', 0, 90, { align: 'center', width: doc.page.width });
    doc.moveDown(0.5);

    // Başlık
    doc
      .font('roboto-bold')
      .fontSize(26)
      .fillColor('#b71c1c')
      .text('VOUCHER', { align: 'center' });
    doc.moveDown();


    // Alt başlık kutusu
    doc
      .rect(40, 120, doc.page.width - 80, 32)
      .fillAndStroke('#f5f5f5', '#bdbdbd')
      .fillColor('#333')
      .font('roboto-bold')
      .fontSize(14)
      .text(`Sayın ${name || ''}`, 0, 128, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown(0.5);



    // Detay başlığı
    doc
      .font('roboto-bold')
      .fontSize(15)
      .fillColor('#b71c1c')
      .text('Rezervasyon Detayları', 0, 160, { align: 'center', width: doc.page.width });
    doc.moveDown(0.2);

    // Detay kutuları: daha kompakt, tek sayfa için optimize
    let y = 180;
    const rowHeight = 22;
    const labelWidth = 120;
    const valueWidth = doc.page.width - 120 - labelWidth;
    (detailRows as [string, string][]).forEach(([label, value]: [string, string]) => {
      if (y > doc.page.height - 120) return; // Taşmayı engelle
      doc
        .rect(60, y, doc.page.width - 120, rowHeight)
        .fillAndStroke('#f5f5f5', '#bdbdbd');
      doc
        .fillColor('#b71c1c')
        .font('roboto-bold')
        .fontSize(11)
        .text(label + ':', 70, y + 6, { width: labelWidth - 10, align: 'left', continued: false });
      doc
        .fillColor('#222')
        .font('roboto')
        .fontSize(11)
        .text(value, 70 + labelWidth, y + 6, { width: valueWidth - 20, align: 'left', continued: false });
      y += rowHeight + 2;
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
