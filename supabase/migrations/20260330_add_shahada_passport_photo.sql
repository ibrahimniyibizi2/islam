-- Add passport_photo_url column to shahada_applications table
ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shahada_applications_passport_photo 
ON shahada_applications(passport_photo_url);
