import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !phone || !role || !password) {
    res.status(400).json({ error: 'Eksik bilgi' });
    return;
  }
  // 1. Supabase Auth ile kullanıcı oluştur
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  const userId = data.user.id;
  // 2. users tablosuna admin olarak ekle
  const { error: dbError } = await supabase
    .from('users')
    .upsert([
      {
        id: userId,
        name,
        email,
        phone,
        role,
        is_email_verified: true,
        is_phone_verified: false,
        created_at: new Date().toISOString(),
        loyalty_points: 0,
        total_reservations: 0,
        preferred_language: 'tr'
      }
    ]);
  if (dbError) {
    res.status(500).json({ error: dbError.message });
    return;
  }
  res.status(200).json({ success: true });
};
