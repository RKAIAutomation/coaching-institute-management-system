-- Align student relationship tables with the app's update/delete flow.
-- This makes parent and batch rows unique per student and ensures student deletes
-- are not blocked by orphaned child rows.

-- RLS policies to allow the app's authenticated management roles to work with
-- students and their related parent/batch records from the browser client.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'students_select_authenticated'
  ) THEN
    CREATE POLICY students_select_authenticated
      ON public.students
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager', 'faculty')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'students_modify_management_roles'
  ) THEN
    CREATE POLICY students_modify_management_roles
      ON public.students
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'parents' AND policyname = 'parents_select_authenticated'
  ) THEN
    CREATE POLICY parents_select_authenticated
      ON public.parents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager', 'faculty')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'parents' AND policyname = 'parents_modify_management_roles'
  ) THEN
    CREATE POLICY parents_modify_management_roles
      ON public.parents
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'student_batches' AND policyname = 'student_batches_select_authenticated'
  ) THEN
    CREATE POLICY student_batches_select_authenticated
      ON public.student_batches
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager', 'faculty')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'student_batches' AND policyname = 'student_batches_modify_management_roles'
  ) THEN
    CREATE POLICY student_batches_modify_management_roles
      ON public.student_batches
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.user_id = auth.uid()
            AND r.name IN ('super_admin', 'institute_admin', 'branch_manager')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  -- Enforce one parent row per student so upsert(student_id) works reliably.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'parents_student_id_key'
      AND conrelid = 'public.parents'::regclass
  ) THEN
    ALTER TABLE public.parents
      ADD CONSTRAINT parents_student_id_key UNIQUE (student_id);
  END IF;

  -- Replace the parent FK with ON DELETE CASCADE if needed.
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'parents_student_id_fkey'
      AND conrelid = 'public.parents'::regclass
  ) THEN
    ALTER TABLE public.parents
      DROP CONSTRAINT parents_student_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'parents_student_id_fkey'
      AND conrelid = 'public.parents'::regclass
  ) THEN
    ALTER TABLE public.parents
      ADD CONSTRAINT parents_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES public.students(id)
      ON DELETE CASCADE;
  END IF;

  -- Enforce one batch assignment row per student.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_batches_student_id_key'
      AND conrelid = 'public.student_batches'::regclass
  ) THEN
    ALTER TABLE public.student_batches
      ADD CONSTRAINT student_batches_student_id_key UNIQUE (student_id);
  END IF;

  -- Replace the student_batches FK with ON DELETE CASCADE if needed.
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_batches_student_id_fkey'
      AND conrelid = 'public.student_batches'::regclass
  ) THEN
    ALTER TABLE public.student_batches
      DROP CONSTRAINT student_batches_student_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_batches_student_id_fkey'
      AND conrelid = 'public.student_batches'::regclass
  ) THEN
    ALTER TABLE public.student_batches
      ADD CONSTRAINT student_batches_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES public.students(id)
      ON DELETE CASCADE;
  END IF;
END $$;
