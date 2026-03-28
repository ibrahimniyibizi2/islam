-- Fix RLS policies for shahada_applications
-- Use security definer functions to avoid permission issues with auth.users

-- Enable RLS
ALTER TABLE IF EXISTS shahada_applications ENABLE ROW LEVEL SECURITY;

-- Drop all existing admin policies
DROP POLICY IF EXISTS "Admins can view all shahada applications" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can update shahada applications" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can view all shahada applications v2" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can update shahada applications v2" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can view all shahada applications v3" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can view all shahada applications v4" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can update shahada applications v4" ON shahada_applications;

-- Create a security definer function to check if user is admin
-- This runs with the privileges of the function owner, not the calling user
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check user_metadata for role
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin');
END;
$$;

-- Alternative function that checks app_metadata
CREATE OR REPLACE FUNCTION is_admin_user_app()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_app_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin');
END;
$$;

-- Function to check profiles.role (if using profiles table)
CREATE OR REPLACE FUNCTION is_admin_user_profile()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin');
END;
$$;

-- Create new admin policies using the security definer functions
CREATE POLICY "Admins can view all shahada applications" ON shahada_applications
  FOR SELECT USING (
    is_admin_user() OR is_admin_user_app() OR is_admin_user_profile()
  );

CREATE POLICY "Admins can update shahada applications" ON shahada_applications
  FOR UPDATE USING (
    is_admin_user() OR is_admin_user_app() OR is_admin_user_profile()
  );

-- Keep the original user policy for users to see their own applications
DROP POLICY IF EXISTS "Users can view their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can view their own shahada applications" ON shahada_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can insert their own shahada applications" ON shahada_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can update their own shahada applications" ON shahada_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;
GRANT EXECUTE ON FUNCTION is_admin_user_app() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user_app() TO anon;
GRANT EXECUTE ON FUNCTION is_admin_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user_profile() TO anon;
