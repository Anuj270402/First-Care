/*
  # Add User Profile Creation Trigger

  1. Changes
    - Add trigger to automatically create user profile when a new user signs up
    - Ensure user profile exists before querying

  2. Security
    - Maintain existing RLS policies
    - Only create profile for authenticated users
*/

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users
INSERT INTO public.users (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;