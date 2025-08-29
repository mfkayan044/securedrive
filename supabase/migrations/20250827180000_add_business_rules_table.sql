-- Migration: Add business_rules table for system-wide business logic
CREATE TABLE IF NOT EXISTS business_rules (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Minimum reservation notice (hours)
INSERT INTO business_rules (key, value, description) VALUES
  ('min_reservation_notice_hours', '0', 'Minimum kaç saat önceden rezervasyon yapılabilir?')
ON CONFLICT (key) DO NOTHING;
