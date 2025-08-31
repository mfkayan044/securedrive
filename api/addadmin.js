// addadmin.js

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

    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !phone || !role || !password) {
      res.status(400).json({ error: 'Eksik bilgi' });
      return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      throw new Error('Supabase auth error: ' + error.message);
    }

    const userId = data.user.id;

    const { error: dbError } = await supabase.from('users').upsert([{
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
    }]);

    if (dbError) {
      throw new Error('Supabase DB error: ' + dbError.message);
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
