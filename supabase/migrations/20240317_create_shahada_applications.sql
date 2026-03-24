-- Create shahada_applications table
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shahada_applications_user_id ON shahada_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_shahada_applications_status ON shahada_applications(status);
CREATE INDEX IF NOT EXISTS idx_shahada_applications_created_at ON shahada_applications(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own applications
CREATE POLICY "Users can view their own shahada applications" ON shahada_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own applications
CREATE POLICY "Users can insert their own shahada applications" ON shahada_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own applications
CREATE POLICY "Users can update their own shahada applications" ON shahada_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for authenticated users to view all applications (for admins)
CREATE POLICY "Admins can view all shahada applications" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'super_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'masjid_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'imam' OR
        auth.users.raw_user_meta_data->>'role' = 'mufti'
      )
    )
  );

-- Create policy for admins to update applications
CREATE POLICY "Admins can update shahada applications" ON shahada_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' = 'super_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'masjid_admin' OR
        auth.users.raw_user_meta_data->>'role' = 'imam' OR
        auth.users.raw_user_meta_data->>'role' = 'mufti'
      )
    )
  );
