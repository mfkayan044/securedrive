/*
  # Price Rules tablosu için admin RLS politikaları

  1. Güvenlik
    - Authenticated kullanıcılar için INSERT, UPDATE, DELETE politikaları eklendi
    - Admin panelinden fiyat yönetimi için gerekli izinler verildi

  2. Değişiklikler
    - INSERT politikası: Authenticated kullanıcılar yeni fiyat kuralı ekleyebilir
    - UPDATE politikası: Authenticated kullanıcılar mevcut fiyat kurallarını güncelleyebilir  
    - DELETE politikası: Authenticated kullanıcılar fiyat kurallarını silebilir
*/

-- Price rules tablosu için INSERT politikası
CREATE POLICY "Authenticated users can insert price rules"
  ON price_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Price rules tablosu için UPDATE politikası
CREATE POLICY "Authenticated users can update price rules"
  ON price_rules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Price rules tablosu için DELETE politikası
CREATE POLICY "Authenticated users can delete price rules"
  ON price_rules
  FOR DELETE
  TO authenticated
  USING (true);