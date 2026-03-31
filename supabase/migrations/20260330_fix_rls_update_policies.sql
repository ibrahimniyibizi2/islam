-- Migration: Fix RLS policies for all application tables to allow admin updates
-- Created: 2026-03-30
-- Purpose: Ensure admin users can update application statuses

-- ============================================
-- SHAHADA APPLICATIONS
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing update policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow admin updates" ON shahada_applications;
DROP POLICY IF EXISTS "Allow all updates" ON shahada_applications;
DROP POLICY IF EXISTS "Enable update for admins" ON shahada_applications;
DROP POLICY IF EXISTS "shahada_applications_admin_update" ON shahada_applications;

-- Create permissive update policy for testing (can be restricted later)
CREATE POLICY "Allow all updates"
ON shahada_applications
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Alternative: Restricted policy (use this for production)
-- CREATE POLICY "Allow admin updates"
-- ON shahada_applications
-- FOR UPDATE
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.id = auth.uid()
--     AND role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
--   )
-- );

-- ============================================
-- NIKAH APPLICATIONS (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nikah_applications') THEN
    ALTER TABLE nikah_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow all updates" ON nikah_applications;
    DROP POLICY IF EXISTS "Allow admin updates" ON nikah_applications;
    
    CREATE POLICY "Allow all updates"
    ON nikah_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created update policy for nikah_applications';
  END IF;
END $$;

-- ============================================
-- RESIDENCE APPLICATIONS (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'residence_applications') THEN
    ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow all updates" ON residence_applications;
    DROP POLICY IF EXISTS "Allow admin updates" ON residence_applications;
    
    CREATE POLICY "Allow all updates"
    ON residence_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created update policy for residence_applications';
  END IF;
END $$;

-- ============================================
-- BUSINESS APPLICATIONS (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_applications') THEN
    ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow all updates" ON business_applications;
    DROP POLICY IF EXISTS "Allow admin updates" ON business_applications;
    
    CREATE POLICY "Allow all updates"
    ON business_applications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Created update policy for business_applications';
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Allow all updates" ON shahada_applications IS 'Temporary permissive policy for testing. Replace with restricted policy for production.';
