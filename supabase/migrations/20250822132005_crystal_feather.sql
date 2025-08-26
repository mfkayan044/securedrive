/*
  # Extra Services tablosu için admin RLS politikaları

  1. Güvenlik
    - Authenticated kullanıcılar için INSERT, UPDATE, DELETE politikaları eklendi
    - Admin panelinden ek hizmet yönetimi için gerekli izinler verildi

  2. Değişiklikler
    - INSERT politikası: Authenticated kullanıcılar yeni ek hizmet ekleyebilir
    - UPDATE politikası: Authenticated kullanıcılar mevcut ek hizmetleri güncelleyebilir  
    - DELETE politikası: Authenticated kullanıcılar ek hizmetleri silebilir
*/

-- Extra services tablosu için INSERT politikası
CREATE POLICY "Authenticated users can insert extra services"
  ON extra_services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Extra services tablosu için UPDATE politikası
CREATE POLICY "Authenticated users can update extra services"
  ON extra_services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Extra services tablosu için DELETE politikası
CREATE POLICY "Authenticated users can delete extra services"
  ON extra_services
  FOR DELETE
  TO authenticated
  USING (true);