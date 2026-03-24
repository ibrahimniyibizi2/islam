-- Create Marriage Applications (Nikah) table
CREATE TABLE IF NOT EXISTS marriage_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  spouse_name text NOT NULL,
  spouse_email text,
  spouse_phone text,
  wedding_date date,
  masjid text,
  imam_name text,
  witnesses text[],
  marriage_type text DEFAULT 'nikah' CHECK (marriage_type IN ('nikah', 'civil', 'both')),
  documents text[], -- marriage documents, IDs, etc.
  special_requirements text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create Residence Certificate Applications table
CREATE TABLE IF NOT EXISTS residence_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  address text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  duration text, -- e.g., "6 months", "1 year", "2 years"
  purpose text NOT NULL, -- e.g., "employment", "family", "education"
  employer_name text,
  employer_address text,
  documents text[], -- passport, visa, work permit, lease, etc.
  special_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create Business Registration Applications table
CREATE TABLE IF NOT EXISTS business_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  business_name text NOT NULL,
  business_type text NOT NULL, -- e.g., "restaurant", "technology", "retail", "services"
  registration_number text,
  capital text NOT NULL, -- e.g., "RWF 5,000,000"
  business_address text NOT NULL,
  business_phone text,
  business_email text,
  directors text[], -- list of directors/partners
  employees_count integer,
  business_description text,
  documents text[], -- business plan, IDs, certificates, etc.
  license_type text DEFAULT 'standard' CHECK (license_type IN ('standard', 'professional', 'industrial')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE marriage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marriage_applications
CREATE POLICY "Users can view their own marriage applications" ON marriage_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marriage applications" ON marriage_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marriage applications" ON marriage_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all marriage applications" ON marriage_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

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

-- Create RLS policies for residence_applications
CREATE POLICY "Users can view their own residence applications" ON residence_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own residence applications" ON residence_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own residence applications" ON residence_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all residence applications" ON residence_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

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

-- Create RLS policies for business_applications
CREATE POLICY "Users can view their own business applications" ON business_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business applications" ON business_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business applications" ON business_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business applications" ON business_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'masjid_admin', 'imam', 'mufti')
      )
    )
  );

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marriage_applications_status ON marriage_applications(status);
CREATE INDEX IF NOT EXISTS idx_marriage_applications_created_at ON marriage_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_marriage_applications_user_id ON marriage_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_residence_applications_status ON residence_applications(status);
CREATE INDEX IF NOT EXISTS idx_residence_applications_created_at ON residence_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_residence_applications_user_id ON residence_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_business_applications_status ON business_applications(status);
CREATE INDEX IF NOT EXISTS idx_business_applications_created_at ON business_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_business_applications_user_id ON business_applications(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_marriage_applications_updated_at BEFORE UPDATE ON marriage_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residence_applications_updated_at BEFORE UPDATE ON residence_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_applications_updated_at BEFORE UPDATE ON business_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
