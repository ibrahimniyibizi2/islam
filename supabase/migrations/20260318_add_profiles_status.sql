ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' NOT NULL;

-- Add constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_status_check' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_status_check
        CHECK (status IN ('active', 'blocked'));
    END IF;
END $$;
