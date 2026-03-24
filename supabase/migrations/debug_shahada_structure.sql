-- Test query to check shahada_applications table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'shahada_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if table exists and has data
SELECT COUNT(*) as total_records FROM shahada_applications;

-- Check sample data structure
SELECT * FROM shahada_applications LIMIT 1;
