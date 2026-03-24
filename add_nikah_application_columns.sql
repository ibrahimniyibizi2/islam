-- Add missing columns to nikah_applications table for certificate generation

-- Add imam_name column
ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS imam_name TEXT;

-- Add witness columns (if not already present)
ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS witness_1_name TEXT;

ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS witness_2_name TEXT;

-- Add certificate-related columns
ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS certificate_number TEXT;

ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nikah_applications_certificate_number 
ON nikah_applications(certificate_number);

-- Add comment describing the columns
COMMENT ON COLUMN nikah_applications.imam_name IS 'Name of the Imam who officiated the Nikah ceremony';
COMMENT ON COLUMN nikah_applications.witness_1_name IS 'Name of the first witness (male witness)';
COMMENT ON COLUMN nikah_applications.witness_2_name IS 'Name of the second witness (female witness)';
COMMENT ON COLUMN nikah_applications.certificate_number IS 'Unique certificate number generated for this marriage';
COMMENT ON COLUMN nikah_applications.certificate_issued_at IS 'Timestamp when the certificate was issued';
