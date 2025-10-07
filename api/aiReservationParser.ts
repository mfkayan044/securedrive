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
          { role: 'system', content: `Kullanıcıdan transfer rezervasyonu için tarih, saat, güzergah, araç tipi, yolcu sayısı, ek hizmetler, iletişim bilgisi gibi alanları doğal dilden çıkar ve SADECE aşağıdaki JSON formatında yanıt ver:\n{\n  \"reservation\": {\n    \"fromLocation\": \"İstanbul Havalimanı\",\n    \"toLocation\": \"Beyoğlu\",\n    \"departureDate\": \"2025-10-10\",\n    \"departureTime\": \"10:00\",\n    \"returnDate\": \"\",\n    \"returnTime\": \"\",\n    \"vehicleType\": \"Mercedes Vito\",\n    \"passengers\": 2,\n    \"extraServices\": [\"Bebek Koltuğu\"],\n    \"customerName\": \"\",\n    \"customerEmail\": \"\",\n    \"customerPhone\": \"\",\n    \"notes\": \"\"\n  }\n}\nEğer eksik bilgi varsa, sadece şu formatta yanıt ver:\n{\"message\": \"Lütfen eksik bilgileri belirtin: ...\"}\nBaşka açıklama, selamlama veya metin ekleme!` },
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
