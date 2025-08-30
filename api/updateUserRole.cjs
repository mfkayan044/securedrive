const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { id, role } = req.query;
  if (!id || !role) {
    res.status(400).json({ error: 'Eksik bilgi' });
    return;
  }
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json({ success: true });
};
