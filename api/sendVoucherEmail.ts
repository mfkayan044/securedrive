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
      ['Transfer Türü', details?.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'],
      ['Alış Tarihi', `${details?.departure_date || '-'} - ${details?.departure_time || '-'}`],
      ['Dönüş Tarihi', `${details?.return_date || '-'} - ${details?.return_time || '-'}`],
      ['Yolcu Adı', details?.customer_name || '-'],
      ['Telefon', details?.customer_phone || '-'],
      ['Yolcu Sayısı', details?.passengers || '-'],
      ['Toplam Tutar', (details?.total_price ? details?.total_price + ' ₺' : '-')],
      ['Gidiş Uçuş Kodu', details?.departure_flight_code || '-'],
      ['Dönüş Uçuş Kodu', details?.return_flight_code || '-'],
    ];



    doc.pipe(pdfStream);

    // LOGO
    try {
      doc.image('logo/logo.png', doc.page.width / 2 - 60, 30, { width: 120 });
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

    // Voucher kodu kutusu
    doc
      .rect(40, 180, doc.page.width - 80, 40)
      .fillAndStroke('#ffcdd2', '#b71c1c')
      .fillColor('#b71c1c')
      .font('roboto-bold')
      .fontSize(18)
      .text(`Voucher Kodunuz: ${voucherCode}`, 0, 192, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown();

    // Detay başlığı
    doc
      .font('roboto-bold')
      .fontSize(15)
      .fillColor('#b71c1c')
      .text('Rezervasyon Detayları', 0, 240, { align: 'center', width: doc.page.width - 80 });
    doc.moveDown();

    // Detay kutusu
    let y = 270;
    detailRows.forEach(([label, value]: [string, string]) => {
      doc
        .rect(60, y, doc.page.width - 120, 28)
        .fillAndStroke('#f5f5f5', '#bdbdbd');
      doc
        .fillColor('#b71c1c')
        .font('roboto-bold')
        .fontSize(12)
        .text(label + ':', 70, y + 8, { continued: true, width: 120 });
      doc
        .fillColor('#333')
        .font('roboto')
        .fontSize(12)
        .text(' ' + value, { continued: false, width: doc.page.width - 220 });
      y += 32;
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
