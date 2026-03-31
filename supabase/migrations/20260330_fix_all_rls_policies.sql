-- Migration: Fix RLS SELECT policy for all application tables
-- Created: 2026-03-30
-- Purpose: Allow authenticated users to read approved/completed applications

-- ============================================
-- SHAHADA APPLICATIONS - Reset RLS policies
-- ============================================

-- Enable RLS
ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow read approved applications" ON shahada_applications;
DROP POLICY IF EXISTS "shahada_applications_select_policy" ON shahada_applications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON shahada_applications;
DROP POLICY IF EXISTS "Allow all updates" ON shahada_applications;
DROP POLICY IF EXISTS "Allow admin updates" ON shahada_applications;
DROP POLICY IF EXISTS "shahada_applications_admin_update" ON shahada_applications;

-- Create permissive SELECT policy for testing
-- This allows ANY authenticated user to read approved/completed applications
CREATE POLICY "Allow read approved applications"
ON shahada_applications
FOR SELECT
USING (
  status IN ('approved', 'completed')
);

-- Create permissive UPDATE policy
CREATE POLICY "Allow all updates"
ON shahada_applications
FOR UPDATE
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Allow read approved applications" ON shahada_applications IS 
'Allows any authenticated user to read approved/completed applications for certificate generation.';

-- ============================================
-- NIKAH APPLICATIONS
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nikah_applications') THEN
    ALTER TABLE nikah_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow read approved applications" ON nikah_applications;
    DROP POLICY IF EXISTS "Allow all updates" ON nikah_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON nikah_applications
    FOR SELECT
    USING (status IN ('approved', 'completed'));
    
    CREATE POLICY "Allow all updates"
    ON nikah_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created RLS policies for nikah_applications';
  END IF;
END $$;

-- ============================================
-- RESIDENCE APPLICATIONS
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'residence_applications') THEN
    ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow read approved applications" ON residence_applications;
    DROP POLICY IF EXISTS "Allow all updates" ON residence_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON residence_applications
    FOR SELECT
    USING (status IN ('approved', 'completed'));
    
    CREATE POLICY "Allow all updates"
    ON residence_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created RLS policies for residence_applications';
  END IF;
END $$;

-- ============================================
-- BUSINESS APPLICATIONS
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_applications') THEN
    ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow read approved applications" ON business_applications;
    DROP POLICY IF EXISTS "Allow all updates" ON business_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON business_applications
    FOR SELECT
    USING (status IN ('approved', 'completed'));
    
    CREATE POLICY "Allow all updates"
    ON business_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created RLS policies for business_applications';
  END IF;
END $$;

-- ============================================
-- VERIFY RLS IS WORKING
-- ============================================

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('shahada_applications', 'nikah_applications', 'residence_applications', 'business_applications')
ORDER BY tablename, policyname;
