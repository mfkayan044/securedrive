/*
  # Admin kullanıcıları için rezervasyon erişim politikaları

  1. Yeni Politikalar
    - Admin kullanıcıları tüm rezervasyonları okuyabilir
    - Admin kullanıcıları tüm rezervasyonları güncelleyebilir
    - Admin kullanıcıları tüm rezervasyonları silebilir

  2. Güvenlik
    - Sadece authenticated kullanıcılar erişebilir
    - Tüm CRUD işlemleri için izin
*/

-- Admin kullanıcıları için tüm rezervasyonları okuma politikası
CREATE POLICY "Admin users can read all reservations v2"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin kullanıcıları için tüm rezervasyonları güncelleme politikası  
CREATE POLICY "Admin users can update all reservations v2"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin kullanıcıları için tüm rezervasyonları silme politikası
CREATE POLICY "Admin users can delete all reservations v2"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (true);