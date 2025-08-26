/*
  # Fix reservations table INSERT RLS policy

  1. Security Changes
    - Drop existing incorrect INSERT policy
    - Create new INSERT policy that allows both authenticated and anonymous users
    - Authenticated users can create reservations with their user_id
    - Anonymous users can create reservations with user_id = NULL
*/

-- Drop existing incorrect INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON reservations;
DROP POLICY IF EXISTS "Allow reservation creation" ON reservations;

-- Create correct INSERT policy for reservations
CREATE POLICY "Allow reservation creation for all users"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Allow anonymous users to create reservations with user_id = NULL
    (auth.uid() IS NULL AND user_id IS NULL) OR
    -- Allow authenticated users to create reservations with their own user_id or NULL
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );