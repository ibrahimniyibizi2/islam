-- Create Shahada Certificate applications table
CREATE TABLE IF NOT EXISTS shahada_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  current_religion text,
  desired_religion text DEFAULT 'Islam',
  reason text,
  references text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create Marriage applications table
CREATE TABLE IF NOT EXISTS marriage_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  spouse_name text NOT NULL,
  wedding_date date,
  masjid text,
  witnesses text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create Residence Certificate applications table
CREATE TABLE IF NOT EXISTS residence_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  address text NOT NULL,
  duration text,
  purpose text,
  documents text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create Business Registration applications table
CREATE TABLE IF NOT EXISTS business_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  business_type text NOT NULL,
  registration_number text,
  capital text,
  directors text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS on all application tables
ALTER TABLE shahada_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marriage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for application tables
-- Shahada applications policy
CREATE POLICY "Users can view shahada applications" ON shahada_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

CREATE POLICY "Users can insert shahada applications" ON shahada_applications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

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

-- Marriage applications policy
CREATE POLICY "Users can view marriage applications" ON marriage_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

CREATE POLICY "Users can insert marriage applications" ON marriage_applications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update marriage applications" ON marriage_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

-- Residence applications policy
CREATE POLICY "Users can view residence applications" ON residence_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

CREATE POLICY "Users can insert residence applications" ON residence_applications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update residence applications" ON residence_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

-- Business applications policy
CREATE POLICY "Users can view business applications" ON business_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

CREATE POLICY "Users can insert business applications" ON business_applications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update business applications" ON business_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shahada_applications_status ON shahada_applications(status);
CREATE INDEX IF NOT EXISTS idx_shahada_applications_created_at ON shahada_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_marriage_applications_status ON marriage_applications(status);
CREATE INDEX IF NOT EXISTS idx_marriage_applications_created_at ON marriage_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_residence_applications_status ON residence_applications(status);
CREATE INDEX IF NOT EXISTS idx_residence_applications_created_at ON residence_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_business_applications_status ON business_applications(status);
CREATE INDEX IF NOT EXISTS idx_business_applications_created_at ON business_applications(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shahada_applications_updated_at BEFORE UPDATE ON shahada_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marriage_applications_updated_at BEFORE UPDATE ON marriage_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residence_applications_updated_at BEFORE UPDATE ON residence_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_applications_updated_at BEFORE UPDATE ON business_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
