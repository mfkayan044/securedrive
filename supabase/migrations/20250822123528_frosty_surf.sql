/*
  # Locations tablosu için admin RLS politikaları

  1. Güvenlik
    - Authenticated kullanıcılar için INSERT, UPDATE, DELETE politikaları eklendi
    - Admin panelinden lokasyon yönetimi için gerekli izinler verildi

  2. Değişiklikler
    - INSERT politikası: Authenticated kullanıcılar yeni lokasyon ekleyebilir
    - UPDATE politikası: Authenticated kullanıcılar mevcut lokasyonları güncelleyebilir  
    - DELETE politikası: Authenticated kullanıcılar lokasyonları silebilir
*/

-- Locations tablosu için INSERT politikası
CREATE POLICY "Authenticated users can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Locations tablosu için UPDATE politikası
CREATE POLICY "Authenticated users can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Locations tablosu için DELETE politikası
CREATE POLICY "Authenticated users can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (true);