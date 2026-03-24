-- Check the actual status values and constraints for nikah_applications
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nikah_applications' 
AND column_name = 'status';

-- Check existing status values in the table
SELECT DISTINCT status, COUNT(*) as count 
FROM nikah_applications 
GROUP BY status 
ORDER BY status;

-- Check for any check constraints
SELECT conname, consrc
FROM pg_constraint 
WHERE conrelid = 'nikah_applications'::regclass 
AND contype = 'c';
