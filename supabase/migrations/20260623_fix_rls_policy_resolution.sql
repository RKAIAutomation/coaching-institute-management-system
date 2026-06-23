-- Fix RLS policy resolution for student management flows.
-- Root cause addressed:
-- - Existing policy lookup could fail when profiles.user_id is not populated.
-- - Policy subqueries can also fail due to cross-table RLS interactions.
--
-- This migration uses SECURITY DEFINER helper functions so policy checks are stable,
-- and supports both user_id and email-based profile mapping.

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS students_select_authenticated ON public.students;
DROP POLICY IF EXISTS students_modify_management_roles ON public.students;
DROP POLICY IF EXISTS parents_select_authenticated ON public.parents;
DROP POLICY IF EXISTS parents_modify_management_roles ON public.parents;
DROP POLICY IF EXISTS student_batches_select_authenticated ON public.student_batches;
DROP POLICY IF EXISTS student_batches_modify_management_roles ON public.student_batches;

CREATE POLICY students_select_authenticated
  ON public.students
  FOR SELECT
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager', 'faculty']));

CREATE POLICY students_modify_management_roles
  ON public.students
  FOR ALL
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']))
  WITH CHECK (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']));

CREATE POLICY parents_select_authenticated
  ON public.parents
  FOR SELECT
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager', 'faculty']));

CREATE POLICY parents_modify_management_roles
  ON public.parents
  FOR ALL
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']))
  WITH CHECK (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']));

CREATE POLICY student_batches_select_authenticated
  ON public.student_batches
  FOR SELECT
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager', 'faculty']));

CREATE POLICY student_batches_modify_management_roles
  ON public.student_batches
  FOR ALL
  TO authenticated
  USING (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']))
  WITH CHECK (public.user_has_any_role(ARRAY['super_admin', 'institute_admin', 'branch_manager']));
