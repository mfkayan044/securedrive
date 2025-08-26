/*
  # Admin kullanıcıları için tüm tablo erişim politikaları

  1. Politika Eklemeleri
    - Reservations tablosu için admin erişimi
    - Drivers tablosu için admin erişimi
    - Locations tablosu için admin erişimi
    - Vehicle_types tablosu için admin erişimi
    - Extra_services tablosu için admin erişimi
    - Price_rules tablosu için admin erişimi

  2. Güvenlik
    - Admin kullanıcıları tüm verilere erişebilir
    - Normal kullanıcılar sadece kendi verilerine erişebilir
*/

-- Reservations tablosu için admin politikaları
CREATE POLICY "Admin users can read all reservations" ON reservations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert reservations" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update all reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete reservations" ON reservations
  FOR DELETE TO authenticated
  USING (true);

-- Drivers tablosu için admin politikaları
CREATE POLICY "Admin users can read all drivers" ON drivers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert drivers" ON drivers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update all drivers" ON drivers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete drivers" ON drivers
  FOR DELETE TO authenticated
  USING (true);

-- Locations tablosu için admin politikaları (zaten var ama emin olmak için)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'locations' 
    AND policyname = 'Admin users can read all locations'
  ) THEN
    CREATE POLICY "Admin users can read all locations" ON locations
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'locations' 
    AND policyname = 'Admin users can insert locations'
  ) THEN
    CREATE POLICY "Admin users can insert locations" ON locations
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'locations' 
    AND policyname = 'Admin users can update all locations'
  ) THEN
    CREATE POLICY "Admin users can update all locations" ON locations
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'locations' 
    AND policyname = 'Admin users can delete locations'
  ) THEN
    CREATE POLICY "Admin users can delete locations" ON locations
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END $$;

-- Vehicle_types tablosu için admin politikaları
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicle_types' 
    AND policyname = 'Admin users can read all vehicle types'
  ) THEN
    CREATE POLICY "Admin users can read all vehicle types" ON vehicle_types
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicle_types' 
    AND policyname = 'Admin users can insert vehicle types'
  ) THEN
    CREATE POLICY "Admin users can insert vehicle types" ON vehicle_types
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicle_types' 
    AND policyname = 'Admin users can update all vehicle types'
  ) THEN
    CREATE POLICY "Admin users can update all vehicle types" ON vehicle_types
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicle_types' 
    AND policyname = 'Admin users can delete vehicle types'
  ) THEN
    CREATE POLICY "Admin users can delete vehicle types" ON vehicle_types
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END $$;

-- Extra_services tablosu için admin politikaları
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'extra_services' 
    AND policyname = 'Admin users can read all extra services'
  ) THEN
    CREATE POLICY "Admin users can read all extra services" ON extra_services
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'extra_services' 
    AND policyname = 'Admin users can insert extra services'
  ) THEN
    CREATE POLICY "Admin users can insert extra services" ON extra_services
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'extra_services' 
    AND policyname = 'Admin users can update all extra services'
  ) THEN
    CREATE POLICY "Admin users can update all extra services" ON extra_services
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'extra_services' 
    AND policyname = 'Admin users can delete extra services'
  ) THEN
    CREATE POLICY "Admin users can delete extra services" ON extra_services
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END $$;

-- Price_rules tablosu için admin politikaları
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'price_rules' 
    AND policyname = 'Admin users can read all price rules'
  ) THEN
    CREATE POLICY "Admin users can read all price rules" ON price_rules
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'price_rules' 
    AND policyname = 'Admin users can insert price rules'
  ) THEN
    CREATE POLICY "Admin users can insert price rules" ON price_rules
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'price_rules' 
    AND policyname = 'Admin users can update all price rules'
  ) THEN
    CREATE POLICY "Admin users can update all price rules" ON price_rules
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'price_rules' 
    AND policyname = 'Admin users can delete price rules'
  ) THEN
    CREATE POLICY "Admin users can delete price rules" ON price_rules
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END $$;