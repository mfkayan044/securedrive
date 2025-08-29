-- Migration: Add maximum reservation advance (days) business rule
INSERT INTO business_rules (key, value, description) VALUES
  ('max_reservation_notice_days', '30', 'Maksimum kaç gün sonrasına rezervasyon yapılabilir?')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;
