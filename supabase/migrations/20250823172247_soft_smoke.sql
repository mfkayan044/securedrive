/*
  # Admin RLS Politikalarını Düzelt

  1. Mevcut Politikalar
    - Tüm kısıtlayıcı politikaları kaldır
    - Admin kullanıcıları için tam erişim politikaları ekle

  2. Yeni Politikalar
    - Authenticated kullanıcılar tüm rezervasyonları görebilir
    - Authenticated kullanıcılar tüm sürücüleri görebilir
    - Authenticated kullanıcılar tüm verileri yönetebilir

  3. Güvenlik
    - RLS aktif kalır ama daha esnek politikalar
*/

-- Rezervasyonlar için mevcut politikaları temizle ve yenilerini ekle
DROP POLICY IF EXISTS "Admin users can read all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can read all reservations v2" ON reservations;
DROP POLICY IF EXISTS "Admin users can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can update all reservations v2" ON reservations;
DROP POLICY IF EXISTS "Admin users can delete all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can delete all reservations v2" ON reservations;

-- Basit admin politikaları
CREATE POLICY "Authenticated users can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all reservations"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- Sürücüler için mevcut politikaları temizle ve yenilerini ekle
DROP POLICY IF EXISTS "Admin users can read all drivers" ON drivers;
DROP POLICY IF EXISTS "Admin users can insert drivers" ON drivers;
DROP POLICY IF EXISTS "Admin users can update drivers" ON drivers;

CREATE POLICY "Authenticated users can read all drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert drivers"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all drivers"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete drivers"
  ON drivers
  FOR DELETE
  TO authenticated
  USING (true);

-- Diğer tablolar için de basit politikalar
CREATE POLICY IF NOT EXISTS "Authenticated users can manage locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage vehicle_types"
  ON vehicle_types
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage extra_services"
  ON extra_services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage price_rules"
  ON price_rules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);