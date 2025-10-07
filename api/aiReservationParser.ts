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
          { role: 'system', content: `Sadece geçerli JSON döndür. Asla açıklama, selamlama, metin veya başka bir şey ekleme. Eksik bilgi varsa: {"message": "Lütfen eksik bilgileri belirtin: alanAdı"} şeklinde yanıt ver. Tüm bilgiler tamamlanınca sadece aşağıdaki gibi bir JSON döndür:
{"reservation": {"fromLocation": "İstanbul Havalimanı (IST)", "toLocation": "Beyoğlu", "tripType": "one-way", "departureDate": "2025-10-10", "departureTime": "10:00", "returnDate": "", "returnTime": "", "vehicleType": "Ekonomi VIP Class", "passengers": 2, "passengerNames": ["Ahmet Yılmaz", "Mehmet Demir"], "extraServices": ["Bebek Koltuğu"], "customerName": "Ahmet Yılmaz", "customerEmail": "ahmet@example.com", "customerPhone": "05321234567", "notes": ""}}
Sadece bu iki JSON formatından birini döndür. Başka hiçbir şey yazma!` },
          ...messages
        ],
        temperature: 0.2
      })
    });
    const result = await openaiRes.json();
    let content = result.choices?.[0]?.message?.content || '';
    // JSON dışı metinleri temizle (daha güvenli)
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      content = match[0];
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
