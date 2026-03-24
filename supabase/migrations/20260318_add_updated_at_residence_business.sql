-- Add missing updated_at columns + triggers for residence_applications and business_applications

-- 1) residence_applications
ALTER TABLE public.residence_applications
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_residence_applications_updated_at'
  ) THEN
    CREATE TRIGGER set_residence_applications_updated_at
    BEFORE UPDATE ON public.residence_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- 2) business_applications
ALTER TABLE public.business_applications
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_business_applications_updated_at'
  ) THEN
    CREATE TRIGGER set_business_applications_updated_at
    BEFORE UPDATE ON public.business_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
