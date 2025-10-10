  console.log('SIB_USER:', process.env.SIB_USER, 'SIB_PASS:', !!process.env.SIB_PASS);
// /api/sendVoucherEmail.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
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
    const pdfStream = new PassThrough();
    let pdfBuffer: Buffer | null = null;
    const chunks: Buffer[] = [];
    doc.pipe(pdfStream);

    // PDF tasarımı

    doc.fontSize(22).fillColor('#1a237e').text('Voucher Bilgilendirmesi', { align: 'center' });
    doc.moveDown && doc.moveDown();

    doc.fontSize(16).fillColor('black').text(`Sayın ${name || ''},`, { align: 'left' });
    doc.text(' '); // spacing

    doc.fontSize(14).text(`Rezervasyonunuz için voucher kodunuz: `, { continued: true });
    doc.fillColor('#388e3c');
    doc.font && doc.font('Helvetica-Bold');
    doc.text(voucherCode);
    doc.fillColor('black');
    doc.font && doc.font('Helvetica');
    doc.text(' '); // spacing

    doc.fontSize(15).fillColor('#1a237e').text('Rezervasyon Detayları:', { underline: true });
    doc.text(' '); // spacing

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


    detailRows.forEach(([label, value]) => {
      doc.font && doc.font('Helvetica-Bold');
      doc.fontSize(12).text(label + ': ', { continued: true });
      doc.font && doc.font('Helvetica');
      doc.fontSize(12).text(value);
    });

    doc.text(' '); // spacing
    doc.fontSize(12).fillColor('gray').text('İyi yolculuklar dileriz.', { align: 'right' });


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
