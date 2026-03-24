-- Complete fix for all application table issues
-- Run this in Supabase SQL Editor

-- 1. Fix business_applications - add updated_at
ALTER TABLE business_applications 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Fix residence_applications - add updated_at  
ALTER TABLE residence_applications 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Fix nikah_applications status constraint - expand to allow all UI statuses
ALTER TABLE nikah_applications 
DROP CONSTRAINT IF EXISTS nikah_applications_status_check;

ALTER TABLE nikah_applications 
ADD CONSTRAINT nikah_applications_status_check 
CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled'));

-- 4. Add rejection_reason to nikah if not exists
ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 5. Create auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for business_applications
DROP TRIGGER IF EXISTS set_business_applications_updated_at ON business_applications;
CREATE TRIGGER set_business_applications_updated_at
BEFORE UPDATE ON business_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for residence_applications  
DROP TRIGGER IF EXISTS set_residence_applications_updated_at ON residence_applications;
CREATE TRIGGER set_residence_applications_updated_at
BEFORE UPDATE ON residence_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
