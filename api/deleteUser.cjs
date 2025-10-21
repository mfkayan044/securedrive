const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  console.log('deleteUser API çağrıldı:', { method: req.method, query: req.query });
  
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    console.log('Yanlış method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (!id) {
    console.log('Eksik ID');
    return res.status(400).json({ error: 'Kullanıcı ID gerekli' });
  }
  
  try {
    console.log('Auth silme başlıyor, ID:', id);
    
    // 1. Supabase Auth'tan kullanıcıyı sil (önce Auth, sonra tablo)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error('Auth silme hatası:', authError.message);
      // Auth hatası olsa bile devam et
    } else {
      console.log('Auth silme başarılı');
    }
    
    console.log('Users tablosundan silme başlıyor...');
    
    // 2. users tablosundan sil
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (dbError) {
      console.error('DB silme hatası:', dbError.message);
      return res.status(500).json({ error: 'Veritabanı silme hatası: ' + dbError.message });
    }
    
    console.log('Kullanıcı tamamen silindi:', id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Kullanıcı başarıyla silindi',
      authDeleted: !authError,
      tableDeleted: true
    });
    
  } catch (err) {
    console.error('Handler hatası:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
