// api/addadmin.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    console.log('Request Method:', req.method);
    console.log('Request Body:', req.body);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !phone || !role || !password) {
      console.error('Eksik bilgi:', { name, email, phone, role, password });
      return res.status(400).json({ error: 'Eksik bilgi' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (error) throw new Error('Auth Error: ' + error.message);
    console.log('Supabase Auth Data:', data);

    const userId = data.user.id;
    const { error: dbError } = await supabase.from('users').upsert([{
      id: userId,
      name, email, phone, role,
      is_email_verified: true,
      is_phone_verified: false,
      created_at: new Date().toISOString(),
      loyalty_points: 0,
      total_reservations: 0,
      preferred_language: 'tr'
    }]);
    if (dbError) throw new Error('DB Error: ' + dbError.message);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
