/*
  # Add conversations insert policy

  1. Security
    - Allow both authenticated and anonymous users to create conversations
    - This enables messaging for both logged-in users and guests who make reservations
*/

-- Allow conversation creation for both authenticated and anonymous users
CREATE POLICY "Allow conversation creation"
  ON conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);