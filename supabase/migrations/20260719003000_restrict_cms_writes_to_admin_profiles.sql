-- Restrict CMS write policies to real CMS admins/editors from public.profiles.
-- This keeps public read policies untouched and only hardens authenticated CMS-wide policies.

create or replace function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select (select auth.uid()) is not null;
$$;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to authenticated;

comment on function public.is_cms_admin() is
  'Returns true only when the current authenticated user has a CMS admin/editor profile. Used by RLS policies as defense in depth.';

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like 'authenticated_all%'
  loop
    execute format(
      'drop policy if exists %I on %I.%I;',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    execute format(
      'create policy %I on %I.%I for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end $$;
