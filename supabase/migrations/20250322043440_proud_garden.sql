/*
  # Fix User Profile RLS and Management

  1. Changes
    - Update RLS policies for users table
    - Add insert policy for new user profiles
    - Add update policy for existing profiles
    - Ensure proper security for user data

  2. Security
    - Only allow users to manage their own profiles
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create comprehensive policies for user profile management
CREATE POLICY "Users can manage their own profile"
  ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Update handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    full_name,
    phone,
    date_of_birth,
    address,
    medical_history,
    allergies,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    '',
    '',
    null,
    '',
    '',
    ARRAY[]::text[],
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;