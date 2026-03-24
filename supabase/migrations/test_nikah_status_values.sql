-- Test nikah application status update to see what values are allowed
-- First, let's see what status values currently exist
SELECT DISTINCT status, COUNT(*) as count 
FROM nikah_applications 
GROUP BY status 
ORDER BY status;

-- Try to update a test record with different status values to see what works
-- This will help us understand the constraint
-- (Uncomment and run with a real ID to test)

-- UPDATE nikah_applications 
-- SET status = 'approved' 
-- WHERE id = 'your-test-id-here';

-- Check the actual constraint definition
SELECT conname, consrc
FROM pg_constraint 
WHERE conrelid = 'nikah_applications'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';
