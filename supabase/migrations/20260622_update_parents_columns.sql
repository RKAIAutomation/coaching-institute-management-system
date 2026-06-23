-- Update parents table column names to match application schema

-- Rename columns if they exist and new names don't
DO $$
BEGIN
  -- Rename full_name to parent_name if full_name exists and parent_name doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'full_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE public.parents RENAME COLUMN full_name TO parent_name;
  END IF;

  -- Rename email to parent_email if email exists and parent_email doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_email'
  ) THEN
    ALTER TABLE public.parents RENAME COLUMN email TO parent_email;
  END IF;

  -- Rename phone to parent_phone if phone exists and parent_phone doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'phone'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_phone'
  ) THEN
    ALTER TABLE public.parents RENAME COLUMN phone TO parent_phone;
  END IF;

  -- Rename relation to parent_relationship if relation exists and parent_relationship doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'relation'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_relationship'
  ) THEN
    ALTER TABLE public.parents RENAME COLUMN relation TO parent_relationship;
  END IF;

  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE public.parents ADD COLUMN parent_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_email'
  ) THEN
    ALTER TABLE public.parents ADD COLUMN parent_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_phone'
  ) THEN
    ALTER TABLE public.parents ADD COLUMN parent_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'parent_relationship'
  ) THEN
    ALTER TABLE public.parents ADD COLUMN parent_relationship text;
  END IF;

END $$;
