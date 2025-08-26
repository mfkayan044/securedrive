/*
  # Admin kullanıcıları için rezervasyon erişim politikaları

  1. Yeni Politikalar
    - Admin kullanıcıları tüm rezervasyonları okuyabilir
    - Admin kullanıcıları tüm rezervasyonları güncelleyebilir
    - Admin kullanıcıları tüm rezervasyonları silebilir

  2. Güvenlik
    - Sadece authenticated kullanıcılar erişebilir
    - Tüm CRUD operasyonları için yetki verilir
*/

-- Admin kullanıcıları tüm rezervasyonları okuyabilir
CREATE POLICY "Admin users can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin kullanıcıları tüm rezervasyonları güncelleyebilir  
CREATE POLICY "Admin users can update all reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin kullanıcıları tüm rezervasyonları silebilir
CREATE POLICY "Admin users can delete all reservations"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (true);