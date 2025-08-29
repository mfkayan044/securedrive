const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

app.post('/api/add-driver', async (req, res) => {
  const { email, password, name, phone, license_number, vehicle_plate, vehicle_model, vehicle_year, vehicle_color, working_hours_start, working_hours_end, languages, is_active } = req.body;

  // 1. Auth'a kullanıcı ekle
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (authError || !authUser.user) {
    return res.status(400).json({ error: authError?.message || 'Auth user creation failed' });
  }

  // 2. Driver tablosuna ekle
  const { error } = await supabase.from('drivers').insert([{
    id: authUser.user.id,
    name,
    email,
    phone,
    license_number,
    vehicle_plate,
    vehicle_model,
    vehicle_year,
    vehicle_color,
    working_hours_start,
    working_hours_end,
    languages,
    is_active,
    rating: 0,
    total_trips: 0
  }]);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
