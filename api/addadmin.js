// addadmin.js
import { createClient } from '@supabase/supabase-js';

// Supabase client'ını oluşturuyoruz
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Yalnızca POST isteği alacağımızı kontrol ediyoruz
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { name, email, phone, role, password } = req.body;

    // Gerekli verilerin olup olmadığını kontrol ediyoruz
    if (!name || !email || !phone || !role || !password) {
      console.error('Eksik bilgi:', { name, email, phone, role, password });
      res.status(400).json({ error: 'Eksik bilgi' });
      return;
    }

    console.log('Kullanıcı ekleme işlemi başlatıldı:', email);

    // Supabase Auth ile kullanıcı oluşturuyoruz
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error('Supabase auth error: ' + error.message);
    }

    console.log('Kullanıcı oluşturuldu:', data.user.id);

    const userId = data.user.id;


    // Sadece admin_users tablosuna ekle
    const { error: adminDbError } = await supabase.from('admin_users').upsert([{
      id: userId,
      name,
      email,
      role,
      permissions: [], // Varsayılan boş, isterseniz frontend'den alabilirsiniz
      is_active: true,
      created_at: new Date().toISOString(),
      last_login_at: null,
      updated_at: new Date().toISOString(),
    }]);
    if (adminDbError) {
      console.error('Supabase admin_users DB error:', adminDbError);
      throw new Error('Supabase admin_users DB error: ' + adminDbError.message);
    }

    // İşlem başarılı ise response gönderiyoruz
    res.status(200).json({ success: true });

  } catch (err) {
    // Eğer bir hata meydana gelirse burada yakalıyoruz
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
