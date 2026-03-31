-- Migration: Fix RLS SELECT policy for shahada_applications
-- Created: 2026-03-30
-- Purpose: Allow authenticated users to read approved/completed applications for certificate generation

-- Enable RLS
ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies if any
DROP POLICY IF EXISTS "Allow read approved applications" ON shahada_applications;
DROP POLICY IF EXISTS "shahada_applications_select_policy" ON shahada_applications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON shahada_applications;

-- Create policy to allow reading approved/completed applications
-- This is needed for the Generate Certificate page to find applications
CREATE POLICY "Allow read approved applications"
ON shahada_applications
FOR SELECT
USING (
  status IN ('approved', 'completed')
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
  )
);

COMMENT ON POLICY "Allow read approved applications" ON shahada_applications IS 
'Allows authenticated users to read approved/completed applications for certificate generation. Admins can read all.';

-- Also ensure we have policies for other tables
DO $$
BEGIN
  -- Nikah applications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nikah_applications') THEN
    ALTER TABLE nikah_applications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow read approved applications" ON nikah_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON nikah_applications
    FOR SELECT
    USING (
      status IN ('approved', 'completed')
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
      )
    );
    
    RAISE NOTICE 'Created SELECT policy for nikah_applications';
  END IF;
  
  -- Residence applications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'residence_applications') THEN
    ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow read approved applications" ON residence_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON residence_applications
    FOR SELECT
    USING (
      status IN ('approved', 'completed')
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
      )
    );
    
    RAISE NOTICE 'Created SELECT policy for residence_applications';
  END IF;
  
  -- Business applications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_applications') THEN
    ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow read approved applications" ON business_applications;
    
    CREATE POLICY "Allow read approved applications"
    ON business_applications
    FOR SELECT
    USING (
      status IN ('approved', 'completed')
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'masjid_admin', 'imam', 'mufti', 'admin')
      )
    );
    
    RAISE NOTICE 'Created SELECT policy for business_applications';
  END IF;
END $$;
