-- Harden Supabase Storage policies and public helper functions.
-- Public media URLs keep working because the media bucket remains public.
-- Listing/writing through the Storage API is restricted to CMS admin/editor profiles.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_updated_at_trigger(tbl text)
returns void
language plpgsql
set search_path = public
as $$
begin
  execute format('drop trigger if exists set_updated_at on public.%I;', tbl);
  execute format(
    'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
    tbl
  );
end;
$$;

create or replace function public.is_authenticated()
returns boolean
language sql
stable
set search_path = public
as $$
  select (select auth.uid()) is not null;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.set_updated_at_trigger(text) from public, anon, authenticated;
revoke all on function public.is_cms_admin() from public, anon, authenticated;
grant execute on function public.is_cms_admin() to authenticated;

drop policy if exists "Public Read" on storage.objects;
drop policy if exists "Authenticated Insert" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;
drop policy if exists "Media CMS Select" on storage.objects;
drop policy if exists "Media CMS Insert" on storage.objects;
drop policy if exists "Media CMS Update" on storage.objects;
drop policy if exists "Media CMS Delete" on storage.objects;

create policy "Media CMS Select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_cms_admin()
  );

create policy "Media CMS Insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and public.is_cms_admin()
  );

create policy "Media CMS Update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_cms_admin()
  )
  with check (
    bucket_id = 'media'
    and public.is_cms_admin()
  );

create policy "Media CMS Delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_cms_admin()
  );
