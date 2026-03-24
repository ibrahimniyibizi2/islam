-- Check the actual structure of shahada_applications table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shahada_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
