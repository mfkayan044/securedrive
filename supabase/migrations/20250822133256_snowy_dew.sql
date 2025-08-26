/*
  # Fix reservations INSERT RLS policy

  1. Security Changes
    - Drop existing faulty INSERT policy
    - Create new policy that works for both anonymous and authenticated users
    - Allow anonymous users to create reservations with user_id = NULL
    - Allow authenticated users to create reservations with their own user_id or NULL
*/

-- Drop the existing faulty policy
DROP POLICY IF EXISTS "Allow reservation creation for all users" ON reservations;

-- Create a new, correct policy for INSERT
CREATE POLICY "Enable reservation creation for all users"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Anonymous users can create reservations with user_id = NULL
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    -- Authenticated users can create reservations with their own user_id or NULL
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );