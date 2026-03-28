-- Fix RLS policies for shahada_applications to allow admin access
-- This migration adds policies that work with the application's role structure

-- Enable RLS (in case it's not already enabled)
ALTER TABLE IF EXISTS shahada_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all shahada applications" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can update shahada applications" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can view all shahada applications v2" ON shahada_applications;
DROP POLICY IF EXISTS "Admins can update shahada applications v2" ON shahada_applications;

-- Create a policy that allows authenticated users with admin role in user_metadata
CREATE POLICY "Admins can view all shahada applications v2" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'super_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'masjid_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'imam' OR
        auth.users.raw_user_meta_data->>'role' = 'mufti' OR
        auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Create policy for admins to update applications
CREATE POLICY "Admins can update shahada applications v2" ON shahada_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'super_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'masjid_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'imam' OR
        auth.users.raw_user_meta_data->>'role' = 'mufti' OR
        auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Also create policy using app_metadata (alternative location for role)
DROP POLICY IF EXISTS "Admins can view all shahada applications v3" ON shahada_applications;
CREATE POLICY "Admins can view all shahada applications v3" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin' OR
        auth.users.raw_app_meta_data->>'role' = 'masjid_admin' OR
        auth.users.raw_app_meta_data->>'role' = 'imam' OR
        auth.users.raw_app_meta_data->>'role' = 'mufti' OR
        auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- Alternative: If using profiles table with role column directly
DROP POLICY IF EXISTS "Admins can view all shahada applications v4" ON shahada_applications;
CREATE POLICY "Admins can view all shahada applications v4" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
    )
  );

-- Alternative update policy using profiles.role
DROP POLICY IF EXISTS "Admins can update shahada applications v4" ON shahada_applications;
CREATE POLICY "Admins can update shahada applications v4" ON shahada_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON shahada_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shahada_applications TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
