-- Fix: Add missing certificate_number column to shahada_applications
ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_number TEXT;

-- Also add certificate_issued_at for consistency
ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
