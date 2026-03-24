-- Add rejection_reason column to nikah_applications table
-- This will allow storing rejection reasons for nikah applications

ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update the status check constraint to include more statuses if needed
-- First, let's see what the current constraint allows
-- Then we can expand it if needed

-- For now, let's keep the existing constraint and just add the column
-- The frontend will handle the status values properly
