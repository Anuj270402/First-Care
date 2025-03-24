/*
  # Fix Duplicate Order Policy

  1. Changes
    - Drop duplicate order policy
    - Ensure clean policy state
*/

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Recreate the policy with updated conditions
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);