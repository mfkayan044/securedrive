import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { id } = req.query;
    const { name, email, phone, role, password } = req.body;
    if (!id || !name || !email || !phone || !role) {
      console.error('Eksik bilgi:', { id, name, email, phone, role });
      res.status(400).json({ error: 'Eksik bilgi' });
      return;
    }
    // Şifre güncelleme istenirse
    if (password) {
      const { error: passError } = await supabase.auth.admin.updateUserById(id, { password });
      if (passError) {
        console.error('Şifre güncelleme hatası:', passError);
        res.status(500).json({ error: passError.message, details: passError });
        return;
      }
    }
    // admin_users tablosunu güncelle
    const { error: dbError } = await supabase.from('admin_users').update({
      name,
      email,
      phone,
      role,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (dbError) {
      console.error('admin_users güncelleme hatası:', dbError);
      res.status(500).json({ error: dbError.message, details: dbError });
      return;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Genel handler hatası:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
  }
}
