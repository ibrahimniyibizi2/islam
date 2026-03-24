-- Test to determine what status values are actually allowed in nikah_applications
-- This will help us understand the constraint

-- First, let's see what constraint exists
SELECT conname, consrc
FROM pg_constraint 
WHERE conrelid = 'nikah_applications'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';

-- Check current status values in the table
SELECT DISTINCT status, COUNT(*) as count 
FROM nikah_applications 
GROUP BY status 
ORDER BY status;

-- If we need to test specific values, we can try updating a test record
-- (Uncomment and use with a real ID to test)

-- UPDATE nikah_applications 
-- SET status = 'test_status' 
-- WHERE id = 'your-test-id-here';
-- This should fail and show us what's allowed
