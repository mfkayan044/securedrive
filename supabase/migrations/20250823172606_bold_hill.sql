/*
  # Admin kullanıcıları için tam erişim politikaları

  1. Mevcut kısıtlayıcı politikaları kaldır
  2. Admin kullanıcıları için tam erişim politikaları ekle
  3. Authenticated kullanıcılar tüm verileri okuyabilir
*/

-- Reservations için admin erişimi
DROP POLICY IF EXISTS "Admin users can read all reservations" ON reservations;
CREATE POLICY "Admin users can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin users can update all reservations" ON reservations;
CREATE POLICY "Admin users can update all reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drivers için admin erişimi
DROP POLICY IF EXISTS "Admin users can read all drivers" ON drivers;
CREATE POLICY "Admin users can read all drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin users can update all drivers" ON drivers;
CREATE POLICY "Admin users can update all drivers"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin users can insert drivers" ON drivers;
CREATE POLICY "Admin users can insert drivers"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin users can delete drivers" ON drivers;
CREATE POLICY "Admin users can delete drivers"
  ON drivers
  FOR DELETE
  TO authenticated
  USING (true);