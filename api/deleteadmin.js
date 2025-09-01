// deleteadmin.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'Eksik bilgi' });
      return;
    }
    // 1. Supabase Auth'tan kullanıcıyı sil
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      res.status(500).json({ error: authError.message });
      return;
    }
    // 2. admin_users tablosundan sil
    const { error: dbError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    if (dbError) {
      res.status(500).json({ error: dbError.message });
      return;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
