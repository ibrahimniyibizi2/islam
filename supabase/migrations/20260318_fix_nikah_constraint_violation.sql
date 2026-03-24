-- Fix nikah_applications constraint violation
-- Step 1: Check current status values
-- Step 2: Update invalid statuses to valid ones
-- Step 3: Add proper constraint

-- First, see what status values exist
-- SELECT DISTINCT status FROM nikah_applications;

-- Update any invalid statuses to 'pending' (or another valid status)
UPDATE nikah_applications 
SET status = 'pending' 
WHERE status IS NULL 
   OR status NOT IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled', 'delivered', 'denied');

-- Now add the constraint safely
ALTER TABLE nikah_applications 
DROP CONSTRAINT IF EXISTS nikah_applications_status_check;

ALTER TABLE nikah_applications 
ADD CONSTRAINT nikah_applications_status_check 
CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled'));

-- Also add other missing columns
ALTER TABLE business_applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE residence_applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE nikah_applications ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create/update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_business_applications_updated_at ON business_applications;
CREATE TRIGGER set_business_applications_updated_at
BEFORE UPDATE ON business_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_residence_applications_updated_at ON residence_applications;
CREATE TRIGGER set_residence_applications_updated_at
BEFORE UPDATE ON residence_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
