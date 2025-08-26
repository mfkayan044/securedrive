/*
  # Fix reservations INSERT policy

  1. Security
    - Update INSERT policy to allow both authenticated users and anonymous users
    - Authenticated users can create reservations with their user_id
    - Anonymous users can create reservations with user_id as NULL
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create reservations" ON reservations;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Allow reservation creation"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR 
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );