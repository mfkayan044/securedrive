-- Migration: Add accepted_at and completed_at columns to reservations
ALTER TABLE reservations
ADD COLUMN accepted_at timestamptz,
ADD COLUMN completed_at timestamptz;
