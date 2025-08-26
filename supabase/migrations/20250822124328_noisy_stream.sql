/*
  # Users tablosu RLS politikalarını düzelt

  1. Mevcut Sorunlar
    - Users tablosunda INSERT politikası yok
    - Kullanıcılar kendi profillerini oluşturamıyor
    - Auth.uid() ile user.id eşleşmiyor

  2. Çözümler
    - INSERT politikası ekle (kullanıcılar kendi profillerini oluşturabilsin)
    - Mevcut SELECT ve UPDATE politikalarını kontrol et
    - Auth.uid() = id kontrolü ekle

  3. Güvenlik
    - Kullanıcılar sadece kendi verilerini görebilir/düzenleyebilir
    - INSERT sırasında auth.uid() = id kontrolü
*/

-- Önce mevcut politikaları kontrol edelim ve gerekirse düzeltelim
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- SELECT politikası: Kullanıcılar sadece kendi verilerini okuyabilir
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT politikası: Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE politikası: Kullanıcılar kendi verilerini güncelleyebilir
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);