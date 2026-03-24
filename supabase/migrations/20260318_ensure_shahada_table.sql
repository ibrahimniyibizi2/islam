-- Ensure shahada_applications table exists with correct structure
-- This migration will create the table if it doesn't exist or add missing columns

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS shahada_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  current_religion TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  conversion_reason TEXT,
  islamic_knowledge TEXT,
  witness1_name TEXT,
  witness1_phone TEXT,
  witness1_relationship TEXT,
  witness2_name TEXT,
  witness2_phone TEXT,
  witness2_relationship TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='first_name') THEN
        ALTER TABLE shahada_applications ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='last_name') THEN
        ALTER TABLE shahada_applications ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='email') THEN
        ALTER TABLE shahada_applications ADD COLUMN email TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='phone') THEN
        ALTER TABLE shahada_applications ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='current_religion') THEN
        ALTER TABLE shahada_applications ADD COLUMN current_religion TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='conversion_reason') THEN
        ALTER TABLE shahada_applications ADD COLUMN conversion_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='witness1_name') THEN
        ALTER TABLE shahada_applications ADD COLUMN witness1_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='witness2_name') THEN
        ALTER TABLE shahada_applications ADD COLUMN witness2_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shahada_applications' AND column_name='rejection_reason') THEN
        ALTER TABLE shahada_applications ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename='shahada_applications' AND rowsecurity=true) THEN
        ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create or replace policies
DROP POLICY IF EXISTS "Users can view their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can view their own shahada applications" ON shahada_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can insert their own shahada applications" ON shahada_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shahada applications" ON shahada_applications;
CREATE POLICY "Users can update their own shahada applications" ON shahada_applications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all shahada applications" ON shahada_applications;
CREATE POLICY "Admins can view all shahada applications" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update shahada applications" ON shahada_applications;
CREATE POLICY "Admins can update shahada applications" ON shahada_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shahada_applications_user_id ON shahada_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_shahada_applications_status ON shahada_applications(status);
CREATE INDEX IF NOT EXISTS idx_shahada_applications_created_at ON shahada_applications(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shahada_applications_updated_at ON shahada_applications;
CREATE TRIGGER update_shahada_applications_updated_at 
    BEFORE UPDATE ON shahada_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
