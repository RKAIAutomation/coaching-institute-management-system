-- Safe, idempotent schema sync for students table.
-- Run in Supabase SQL Editor (or via supabase migration tooling).

alter table public.students
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists admission_date date default current_date,
  add column if not exists admission_number text,
  add column if not exists gender text,
  add column if not exists address text,
  add column if not exists profile_id uuid;

-- Optional: backfill first_name / last_name from full_name if older rows exist.
-- This is safe to keep even if full_name does not exist; comment out if not needed.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'full_name'
  ) then
    update public.students
    set
      first_name = coalesce(nullif(first_name, ''), split_part(full_name, ' ', 1)),
      last_name = coalesce(
        nullif(last_name, ''),
        nullif(regexp_replace(full_name, '^\\S+\\s*', ''), '')
      )
    where coalesce(first_name, '') = '' or coalesce(last_name, '') = '';
  end if;
end $$;
