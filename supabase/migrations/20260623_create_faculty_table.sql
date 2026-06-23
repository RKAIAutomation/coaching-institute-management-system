-- Faculty management schema

CREATE TABLE IF NOT EXISTS public.faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  gender text,
  qualification text,
  specialization text,
  experience_years numeric(5,2),
  joining_date date NOT NULL,
  salary numeric(12,2),
  status text NOT NULL DEFAULT 'active',
  address text,
  emergency_contact text,
  institute_id uuid,
  branch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faculty_branch_id ON public.faculty(branch_id);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON public.faculty(status);
CREATE INDEX IF NOT EXISTS idx_faculty_specialization ON public.faculty(specialization);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_code ON public.faculty(employee_code);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON public.faculty(email);

ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.user_id = auth.uid()
     OR lower(coalesce(p.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.user_has_any_role(_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.current_user_role_name() = ANY(_roles), false)
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role_name() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_any_role(text[]) TO authenticated;

DROP POLICY IF EXISTS faculty_select_authenticated ON public.faculty;
DROP POLICY IF EXISTS faculty_modify_management_roles ON public.faculty;

CREATE POLICY faculty_select_authenticated
  ON public.faculty
  FOR SELECT
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager', 'faculty']));

CREATE POLICY faculty_modify_management_roles
  ON public.faculty
  FOR ALL
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']))
  WITH CHECK (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']));
