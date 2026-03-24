-- Comprehensive migration to fix all application table issues
-- This single migration will resolve all schema mismatches

-- 1. Fix nikah_applications status constraint and add rejection_reason
ALTER TABLE nikah_applications 
DROP CONSTRAINT IF EXISTS nikah_applications_status_check;

ALTER TABLE nikah_applications 
ADD CONSTRAINT nikah_applications_status_check 
CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled', 'denied', 'delivered'));

ALTER TABLE nikah_applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Create residence_applications table
CREATE TABLE IF NOT EXISTS residence_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  address TEXT NOT NULL,
  duration TEXT, -- e.g., "6 months", "1 year"
  purpose TEXT, -- e.g., "employment", "education", "family"
  documents TEXT[], -- passport, visa, work permit, lease, etc.
  special_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'denied', 'delivered')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create business_applications table
CREATE TABLE IF NOT EXISTS business_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  business_name TEXT NOT NULL,
  business_type TEXT, -- e.g., "retail", "service", "manufacturing"
  business_description TEXT,
  registration_number TEXT,
  capital TEXT,
  directors TEXT[], -- list of director names
  business_address TEXT,
  documents TEXT[], -- business plan, IDs, certificates, etc.
  license_type TEXT DEFAULT 'standard' CHECK (license_type IN ('standard', 'professional', 'industrial')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'denied', 'delivered')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create/Update audit_logs table with proper schema
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  target_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. Enable RLS on all new tables
ALTER TABLE residence_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for residence_applications
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

-- 7. Create RLS policies for business_applications
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

-- 8. Create RLS policies for audit_logs
CREATE POLICY "Super admins can manage audit logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id = (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1)
    )
  );

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_residence_applications_user_id ON residence_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_residence_applications_status ON residence_applications(status);
CREATE INDEX IF NOT EXISTS idx_residence_applications_created_at ON residence_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_business_applications_user_id ON business_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_business_applications_status ON business_applications(status);
CREATE INDEX IF NOT EXISTS idx_business_applications_created_at ON business_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 10. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_residence_applications_updated_at 
    BEFORE UPDATE ON residence_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_applications_updated_at 
    BEFORE UPDATE ON business_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Add sample data for testing (optional)
INSERT INTO residence_applications (
  user_id, applicant_name, applicant_email, applicant_phone, address, duration, purpose, status
) VALUES
  (
    gen_random_uuid(), 'John Resident', 'john.resident@example.com', '+250788123456',
    'Kigali, Kiyovu', '1 year', 'Employment verification', 'pending'
  ),
  (
    gen_random_uuid(), 'Jane Dweller', 'jane.dweller@example.com', '+250789234567',
    'Kigali, Nyabugogo', '6 months', 'Rental agreement', 'approved'
  )
ON CONFLICT DO NOTHING;

INSERT INTO business_applications (
  user_id, applicant_name, applicant_email, applicant_phone, business_name, business_type, 
  business_description, registration_number, capital, status
) VALUES
  (
    gen_random_uuid(), 'Ahmed Entrepreneur', 'ahmed.business@example.com', '+250787345678',
    'Rwanda Tech Solutions', 'technology', 'Software development company', 'RB123456', '10,000,000 RWF', 'pending'
  ),
  (
    gen_random_uuid(), 'Fatima Trader', 'fatima.trade@example.com', '+250786456789',
    'Kigali General Store', 'retail', 'General merchandise store', 'RB789012', '5,000,000 RWF', 'approved'
  )
ON CONFLICT DO NOTHING;
