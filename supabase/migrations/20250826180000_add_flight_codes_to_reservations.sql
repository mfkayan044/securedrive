-- Rezervasyonlara uçuş kodu alanları ekle
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS departure_flight_code text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS return_flight_code text;
