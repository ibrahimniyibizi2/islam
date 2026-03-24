-- Quick fix: Add updated_at columns to fix PGRST204 errors
-- Run this in Supabase SQL Editor

ALTER TABLE residence_applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE business_applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add auto-update trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS set_residence_applications_updated_at ON residence_applications;
CREATE TRIGGER set_residence_applications_updated_at
BEFORE UPDATE ON residence_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_business_applications_updated_at ON business_applications;
CREATE TRIGGER set_business_applications_updated_at
BEFORE UPDATE ON business_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
