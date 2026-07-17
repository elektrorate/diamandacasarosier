-- Phase 1: secure public page settings without changing CMS server writes.
-- CMS mutations use the server-only service_role client, which bypasses RLS.

alter table public.home_page_settings enable row level security;
alter table public.shop_page_settings enable row level security;
alter table public.offering_public_hero_settings enable row level security;
alter table public.blog_page_settings enable row level security;
alter table public.studio_page_settings enable row level security;

-- Remove the legacy policies that allowed unrestricted writes.
drop policy if exists "Blog page settings are admin writable" on public.blog_page_settings;
drop policy if exists "Blog page settings are publicly readable" on public.blog_page_settings;
drop policy if exists "Studio page settings are admin writable" on public.studio_page_settings;
drop policy if exists "Studio page settings are publicly readable" on public.studio_page_settings;

-- Make reruns deterministic.
drop policy if exists "public_read_home_page_settings" on public.home_page_settings;
drop policy if exists "public_read_shop_page_settings" on public.shop_page_settings;
drop policy if exists "public_read_offering_hero_settings" on public.offering_public_hero_settings;
drop policy if exists "public_read_blog_page_settings" on public.blog_page_settings;
drop policy if exists "public_read_studio_page_settings" on public.studio_page_settings;

-- Defence in depth: public API roles only receive SELECT privileges.
revoke insert, update, delete, truncate, references, trigger
  on public.home_page_settings,
     public.shop_page_settings,
     public.offering_public_hero_settings,
     public.blog_page_settings,
     public.studio_page_settings
  from anon, authenticated;

grant select
  on public.home_page_settings,
     public.shop_page_settings,
     public.offering_public_hero_settings,
     public.blog_page_settings,
     public.studio_page_settings
  to anon, authenticated;

create policy "public_read_home_page_settings"
  on public.home_page_settings
  for select
  to anon, authenticated
  using (status = 'published');

create policy "public_read_shop_page_settings"
  on public.shop_page_settings
  for select
  to anon, authenticated
  using (status = 'published');

create policy "public_read_blog_page_settings"
  on public.blog_page_settings
  for select
  to anon, authenticated
  using (status = 'published');

create policy "public_read_studio_page_settings"
  on public.studio_page_settings
  for select
  to anon, authenticated
  using (status = 'published');

create policy "public_read_offering_hero_settings"
  on public.offering_public_hero_settings
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.offerings
      where offerings.id = offering_public_hero_settings.offering_id
        and offerings.status = 'published'
        and offerings.deleted_at is null
    )
  );
