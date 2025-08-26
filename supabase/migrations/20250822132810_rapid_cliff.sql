/*
  # Add RLS policy for reservation_extra_services table

  1. Security
    - Enable INSERT policy for reservation_extra_services table
    - Allow both anonymous and authenticated users to add extra services to reservations
*/

-- Add INSERT policy for reservation_extra_services
CREATE POLICY "Allow reservation extra services creation"
  ON reservation_extra_services
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);