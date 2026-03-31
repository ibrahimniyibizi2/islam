-- Add national_id column to shahada_applications table
-- This migration adds the national_id column if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='national_id') THEN
        ALTER TABLE shahada_applications ADD COLUMN national_id VARCHAR(20);
    END IF;
END $$;

-- Add comment explaining the column
COMMENT ON COLUMN shahada_applications.national_id IS 'National ID number of the applicant (e.g., Rwandan National ID)';
