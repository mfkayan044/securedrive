import type { VercelRequest, VercelResponse } from 'vercel';

// Not: Gerçek anahtarınızı .env dosyasına koyun ve process.env.OPENAI_API_KEY ile kullanın
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Geçersiz istek' });
  }

  try {
    // OpenAI Chat API'ye istek
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Sen bir transfer rezervasyon asistanısın. Kullanıcıdan aşağıdaki alanları sırayla ve adım adım iste:\n1. Nereden nereye? (fromLocation, toLocation)\n2. Transfer tipi: Tek yön mü, gidiş-dönüş mü? (tripType: \"one-way\" veya \"round-trip\")\n3. Tarih ve saat (departureDate, departureTime, returnDate, returnTime)\n4. Kaç kişi? (passengers)\n5. Yolcu ad-soyadları (passengerNames: her biri ayrı string)\n6. Araç tipi: Sadece \"Ekonomi VIP Class\" veya \"Bus VIP Class\" (vehicleType)\n7. Ek hizmetler (extraServices: ör. Bebek Koltuğu, Ek Bagaj, Karşılama Hizmeti)\n8. Rezervasyon sahibi adı, e-posta, telefon (customerName, customerEmail, customerPhone)\n9. Not (notes)\nHer seferinde SADECE bir eksik alanı sor. Tüm bilgiler tamamlanınca aşağıdaki JSON formatında özetle ve onay iste:\n{\"reservation\": {\"fromLocation\": \"İstanbul Havalimanı\", \"toLocation\": \"Beyoğlu\", \"tripType\": \"one-way\", \"departureDate\": \"2025-10-10\", \"departureTime\": \"10:00\", \"returnDate\": \"\", \"returnTime\": \"\", \"vehicleType\": \"Ekonomi VIP Class\", \"passengers\": 2, \"passengerNames\": [\"Ahmet Yılmaz\", \"Mehmet Demir\"], \"extraServices\": [\"Bebek Koltuğu\"], \"customerName\": \"Ahmet Yılmaz\", \"customerEmail\": \"ahmet@example.com\", \"customerPhone\": \"05321234567\", \"notes\": \"\"}}\nEğer eksik bilgi varsa, sadece şu formatta yanıt ver:\n{\"message\": \"Lütfen eksik bilgileri belirtin: [sorulacak alan]\"}\nBaşka açıklama, selamlama veya metin ekleme!` },
          ...messages
        ],
        temperature: 0.2
      })
    });
    const result = await openaiRes.json();
    let content = result.choices?.[0]?.message?.content || '';
    // JSON dışı metinleri temizle
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    let json;
    try {
      json = JSON.parse(content);
    } catch {
      json = { message: content };
    }
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ message: 'AI servisi hatası' });
  }
}
