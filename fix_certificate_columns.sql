-- Fix missing certificate_issued_at column
ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;

-- Also ensure certificate_sent columns exist
ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMP WITH TIME ZONE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
