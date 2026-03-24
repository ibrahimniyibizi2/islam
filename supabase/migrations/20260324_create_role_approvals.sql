-- Role Approvals Table
-- Stores role assignment/approval records

CREATE TABLE IF NOT EXISTS role_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE role_approvals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own role approvals"
  ON role_approvals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all role approvals"
  ON role_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Insert sample data if table is empty
INSERT INTO role_approvals (user_id, role, status, requested_at)
SELECT gen_random_uuid(), 'imam', 'pending', now()
WHERE NOT EXISTS (SELECT 1 FROM role_approvals LIMIT 1);
