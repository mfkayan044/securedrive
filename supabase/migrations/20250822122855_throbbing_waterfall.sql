/*
  # Add admin policies for vehicle_types table

  1. Security
    - Add policy for authenticated users to insert vehicle types
    - Add policy for authenticated users to update vehicle types  
    - Add policy for authenticated users to delete vehicle types
    - These policies assume admin users are authenticated users with proper permissions

  2. Notes
    - These policies allow any authenticated user to manage vehicle types
    - In production, you may want to restrict this to specific admin roles
*/

-- Allow authenticated users to insert vehicle types
CREATE POLICY "Authenticated users can insert vehicle types"
  ON vehicle_types
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update vehicle types
CREATE POLICY "Authenticated users can update vehicle types"
  ON vehicle_types
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete vehicle types
CREATE POLICY "Authenticated users can delete vehicle types"
  ON vehicle_types
  FOR DELETE
  TO authenticated
  USING (true);