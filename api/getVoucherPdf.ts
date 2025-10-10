import type { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';
import path from 'path';
import { PassThrough } from 'stream';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği destekleniyor.' });
  }

  let { reservationDetails } = req.body;
  if (typeof reservationDetails === 'string') {
    try {
      reservationDetails = JSON.parse(reservationDetails);
    } catch {
      return res.status(400).json({ error: 'Rezervasyon detayları çözümlenemedi.' });
    }
  }
  const details = reservationDetails;

  // PDF oluştur
  const doc: any = new PDFDocument({ size: 'A4', margin: 40 });
  doc.registerFont('roboto', path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'));
  doc.registerFont('roboto-bold', path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'));
  const pdfStream = new PassThrough();
  doc.pipe(pdfStream);

  // LOGO sol üst köşe
  try {
    const logoPath = path.join(process.cwd(), 'logo', 'logo.png');
    doc.image(logoPath, 42, 28, { width: 130, height: 28 });
  } catch {}

  const reservationNo = details?.reservation_number || details?.id || '-';
  doc
    .rect(doc.page.width - 170, 28, 120, 28)
    .fillAndStroke('#ffcdd2', '#b71c1c')
    .fillColor('#b71c1c')
    .font('roboto-bold')
    .fontSize(10)
    .text('Rezervasyon No:', doc.page.width - 162, 36, { width: 80, align: 'left' })
    .fontSize(12)
    .text(reservationNo, doc.page.width - 102, 34, { width: 60, align: 'right' });

  doc.font('roboto-bold').fontSize(18).fillColor('#b71c1c').text('VOUCHER', 0, 70, { align: 'center', width: doc.page.width });
  doc.moveDown(0.2);
  doc.rect(40, 100, doc.page.width - 80, 22).fillAndStroke('#f5f5f5', '#bdbdbd').fillColor('#333').font('roboto-bold').fontSize(10).text(`Sayın ${details?.customer_name || ''}`, 0, 106, { align: 'center', width: doc.page.width - 80 });
  doc.moveDown(0.1);
  doc.font('roboto-bold').fontSize(11).fillColor('#b71c1c').text('Rezervasyon Detayları', 0, 125, { align: 'center', width: doc.page.width });
  doc.moveDown(0.1);

  // Detay satırları
  const detailRows = [
    ['Ad Soyad', details?.customer_name?.toString().trim() || '-'],
    ['E-posta', details?.customer_email?.toString().trim() || '-'],
    ['Telefon', details?.customer_phone?.toString().trim() || '-'],
    [
      'Güzergah',
      (details?.from_location_name && details?.to_location_name)
        ? `${details.from_location_name} → ${details.to_location_name}`
        : (details?.route_name || details?.route || details?.guzergah || details?.guzergah_adi || details?.guzergah_name || details?.guzergahadi || details?.guzergahname || details?.from_location || details?.from || details?.pickup_location || '-') +
          ' → ' +
          (details?.to_location_name || details?.to_location || details?.to || details?.dropoff_location || details?.varis || details?.varis_nokta || details?.varis_adi || details?.varisadi || details?.varisname || '-')
    ],
    ['Transfer Türü', details?.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'],
    ['Gidiş Tarihi', `${details?.departure_date || '-'} - ${details?.departure_time || '-'}`],
    ['Dönüş Tarihi', `${details?.return_date || '-'} - ${details?.return_time || '-'}`],
    ['Gidiş Uçuş Kodu', details?.departure_flight_code?.toString().trim() || '-'],
    ['Dönüş Uçuş Kodu', details?.return_flight_code?.toString().trim() || '-'],
    ['Yolcu Sayısı', details?.passengers?.toString().trim() || '-'],
    ['Yolcu İsimleri', Array.isArray(details?.passenger_names) ? details.passenger_names.join(', ') : (details?.passenger_names?.toString().trim() || '-')],
    [
      'Araç Seçimi',
      details?.vehicle_type_name?.toString().trim() || details?.vehicle_type?.toString().trim() || details?.vehicle?.toString().trim() || details?.vehicle_name?.toString().trim() || details?.vehicleType?.toString().trim() || details?.vehicle_selection?.toString().trim() || details?.arac || details?.arac_adi || details?.aracadi || details?.arac_name || '-'
    ],
    ['Ek Hizmetler', Array.isArray(details?.extra_services) ? details.extra_services.join(', ') : (details?.extra_services?.toString().trim() || '-')],
    ['Ödeme Durumu', details?.payment_status?.toString().trim() || '-'],
    ['Notlar', details?.notes?.toString().trim() || '-'],
    ['Toplam Tutar', (details?.total_price ? details.total_price + ' ₺' : '-')],
  ];

  let y = 135;
  const rowHeight = 14;
  const labelWidth = 90;
  const valueWidth = doc.page.width - 120 - labelWidth;
  (detailRows as [string, string][]).forEach(([label, value]: [string, string]) => {
    if (y > doc.page.height - 100) return;
    doc.rect(60, y, doc.page.width - 120, rowHeight).fillAndStroke('#f5f5f5', '#bdbdbd');
    doc.fillColor('#b71c1c').font('roboto-bold').fontSize(8).text(label + ':', 70, y + 2, { width: labelWidth - 10, align: 'left', continued: false });
    doc.fillColor('#222').font('roboto').fontSize(8).text(value, 70 + labelWidth, y + 2, { width: valueWidth - 20, align: 'left', continued: false });
    y += rowHeight + 1;
  });

  doc.rect(0, doc.page.height - 80, doc.page.width, 80).fill('#eeeeee');
  doc.fillColor('#b71c1c').font('roboto-bold').fontSize(12).text('İyi yolculuklar dileriz.', 0, doc.page.height - 60, { align: 'center', width: doc.page.width });
  doc.fillColor('#757575').font('roboto').fontSize(10).text('www.securedrive.org  |  operasyon@securedrive.org', 0, doc.page.height - 40, { align: 'center', width: doc.page.width });

  doc.end();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="voucher_${reservationNo}.pdf"`);
  pdfStream.on('data', (chunk) => res.write(chunk));
  pdfStream.on('end', () => res.end());
  pdfStream.on('error', (err) => {
    res.status(500).json({ error: 'PDF oluşturulamadı', detail: err?.message || String(err) });
  });
}
