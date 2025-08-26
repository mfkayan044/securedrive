/*
  # İstanbul Transfer - Veritabanı Şeması

  1. Tablolar
    - `users` - Kullanıcı bilgileri
    - `drivers` - Sürücü bilgileri
    - `locations` - Lokasyon bilgileri
    - `vehicle_types` - Araç tipleri
    - `extra_services` - Ek hizmetler
    - `price_rules` - Fiyat kuralları
    - `reservations` - Rezervasyonlar
    - `conversations` - Mesajlaşma sohbetleri
    - `messages` - Mesajlar
    - `admin_users` - Admin kullanıcıları

  2. Güvenlik
    - RLS tüm tablolarda aktif
    - Kullanıcı bazlı erişim politikaları
    - Admin ve sürücü rolleri

  3. İlişkiler
    - Foreign key kısıtlamaları
    - Cascade delete işlemleri
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  address text,
  loyalty_points integer DEFAULT 0,
  total_reservations integer DEFAULT 0,
  preferred_language text DEFAULT 'tr' CHECK (preferred_language IN ('tr', 'en')),
  is_email_verified boolean DEFAULT false,
  is_phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  license_number text UNIQUE NOT NULL,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_trips integer DEFAULT 0,
  is_active boolean DEFAULT true,
  profile_image text,
  vehicle_plate text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year integer NOT NULL,
  vehicle_color text NOT NULL,
  working_hours_start time NOT NULL DEFAULT '06:00',
  working_hours_end time NOT NULL DEFAULT '22:00',
  languages text[] DEFAULT ARRAY['tr'],
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('airport', 'district', 'hotel', 'landmark')),
  address text NOT NULL,
  coordinates jsonb,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicle types table
CREATE TABLE IF NOT EXISTS vehicle_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  description text NOT NULL,
  image text NOT NULL,
  features text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  base_price numeric(10,2) NOT NULL CHECK (base_price >= 0),
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Driver vehicle types junction table
CREATE TABLE IF NOT EXISTS driver_vehicle_types (
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_type_id uuid REFERENCES vehicle_types(id) ON DELETE CASCADE,
  PRIMARY KEY (driver_id, vehicle_type_id)
);

-- Extra services table
CREATE TABLE IF NOT EXISTS extra_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  icon text NOT NULL,
  is_active boolean DEFAULT true,
  category text NOT NULL CHECK (category IN ('safety', 'comfort', 'service', 'accessibility')),
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Price rules table
CREATE TABLE IF NOT EXISTS price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  vehicle_type_id uuid REFERENCES vehicle_types(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  is_active boolean DEFAULT true,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_to date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_location_id, to_location_id, vehicle_type_id)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  trip_type text NOT NULL CHECK (trip_type IN ('one-way', 'round-trip')),
  from_location_id uuid REFERENCES locations(id) ON DELETE RESTRICT,
  to_location_id uuid REFERENCES locations(id) ON DELETE RESTRICT,
  vehicle_type_id uuid REFERENCES vehicle_types(id) ON DELETE RESTRICT,
  departure_date date NOT NULL,
  departure_time time NOT NULL,
  return_date date,
  return_time time,
  passengers integer NOT NULL CHECK (passengers > 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'on-route', 'completed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method text,
  payment_id text,
  notes text,
  admin_notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reservation extra services junction table
CREATE TABLE IF NOT EXISTS reservation_extra_services (
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  extra_service_id uuid REFERENCES extra_services(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  PRIMARY KEY (reservation_id, extra_service_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  admin_joined boolean DEFAULT false,
  admin_user_id uuid,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'driver', 'admin')),
  sender_name text NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'location', 'image')),
  metadata jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
  permissions text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_extra_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to read admin_users
CREATE POLICY "Allow all authenticated users to read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for drivers
CREATE POLICY "Drivers can read own data" ON drivers
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Drivers can update own data" ON drivers
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for public data (locations, vehicle_types, extra_services)
CREATE POLICY "Anyone can read locations" ON locations
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read vehicle types" ON vehicle_types
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read extra services" ON extra_services
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read price rules" ON price_rules
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- RLS Policies for reservations
CREATE POLICY "Users can read own reservations" ON reservations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create reservations" ON reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Drivers can read assigned reservations" ON reservations
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update assigned reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Users can access own conversations" ON conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR driver_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can access conversation messages" ON messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_id = auth.uid() OR conversations.driver_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_driver_id ON reservations(driver_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_reservation_id ON conversations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_types_updated_at BEFORE UPDATE ON vehicle_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extra_services_updated_at BEFORE UPDATE ON extra_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON price_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();