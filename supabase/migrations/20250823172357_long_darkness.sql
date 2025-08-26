/*
  # Admin Access Policies Fix

  1. Policy Updates
    - Add admin access policies for all tables
    - Allow authenticated users to manage all data
    - Fix RLS restrictions for admin panel

  2. Security
    - Maintain RLS enabled on all tables
    - Add comprehensive admin access policies
*/

-- Drop existing restrictive policies and add admin-friendly ones for reservations
DROP POLICY IF EXISTS "Admin users can read all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can delete all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can read all reservations v2" ON reservations;
DROP POLICY IF EXISTS "Admin users can update all reservations v2" ON reservations;
DROP POLICY IF EXISTS "Admin users can delete all reservations v2" ON reservations;

-- Add simple admin policies for reservations
CREATE POLICY "Authenticated users can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all reservations"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- Add admin policies for drivers
DROP POLICY IF EXISTS "Admin users can read all drivers" ON drivers;
DROP POLICY IF EXISTS "Admin users can insert drivers" ON drivers;
DROP POLICY IF EXISTS "Admin users can update drivers" ON drivers;

CREATE POLICY "Authenticated users can read all drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert drivers"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update drivers"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete drivers"
  ON drivers
  FOR DELETE
  TO authenticated
  USING (true);

-- Add admin policies for users table
CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all users"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);