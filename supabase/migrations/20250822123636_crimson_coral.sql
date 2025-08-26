/*
  # Locations tablosu için anonim kullanıcı politikaları

  1. Güvenlik
    - Anonim kullanıcıların locations tablosuna INSERT yapabilmesi için politika
    - Anonim kullanıcıların locations tablosunu UPDATE yapabilmesi için politika
    - Anonim kullanıcıların locations tablosunu DELETE yapabilmesi için politika
  
  Not: Bu geçici bir çözümdür. Üretim ortamında admin authentication kullanılmalıdır.
*/

-- Anonim kullanıcılar locations tablosuna INSERT yapabilir
CREATE POLICY "Allow anon insert locations"
  ON locations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anonim kullanıcılar locations tablosunu UPDATE yapabilir  
CREATE POLICY "Allow anon update locations"
  ON locations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Anonim kullanıcılar locations tablosunu DELETE yapabilir
CREATE POLICY "Allow anon delete locations"
  ON locations
  FOR DELETE
  TO anon
  USING (true);