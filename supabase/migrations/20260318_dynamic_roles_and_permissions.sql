CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

INSERT INTO public.roles (name, description, is_system)
VALUES
  ('super_admin', 'Super Admin', true),
  ('masjid_admin', 'Masjid Admin', true),
  ('imam', 'Imam', true),
  ('mufti', 'Mufti', true),
  ('funeral_service', 'Funeral Service Provider', true),
  ('ngo_manager', 'NGO Manager', true),
  ('government_liaison', 'Government Liaison', true),
  ('event_manager', 'Event Manager', true),
  ('board_member', 'Board Member', true),
  ('general_staff', 'General Staff', true),
  ('public_user', 'Public User', true)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_id uuid;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_id_fkey
FOREIGN KEY (role_id) REFERENCES public.roles(id)
ON DELETE SET NULL;

UPDATE public.profiles p
SET role_id = r.id
FROM public.roles r
WHERE p.role_id IS NULL
  AND p.role IS NOT NULL
  AND r.name = p.role;

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view roles" ON public.roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated can view roles" ON public.roles;
DROP POLICY IF EXISTS "Super admins can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated can view roles" ON public.roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can view roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage roles" ON public.roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view role permissions" ON public.role_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );
