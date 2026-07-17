-- Emergency rollback for migration 035.
-- Restores the exact security posture that existed before phase 1.

drop policy if exists "public_read_home_page_settings" on public.home_page_settings;
drop policy if exists "public_read_shop_page_settings" on public.shop_page_settings;
drop policy if exists "public_read_offering_hero_settings" on public.offering_public_hero_settings;
drop policy if exists "public_read_blog_page_settings" on public.blog_page_settings;
drop policy if exists "public_read_studio_page_settings" on public.studio_page_settings;

grant insert, update, delete, truncate, references, trigger
  on public.home_page_settings,
     public.shop_page_settings,
     public.offering_public_hero_settings,
     public.blog_page_settings,
     public.studio_page_settings
  to anon, authenticated;

alter table public.home_page_settings disable row level security;
alter table public.shop_page_settings disable row level security;
alter table public.offering_public_hero_settings disable row level security;

alter table public.blog_page_settings enable row level security;
alter table public.studio_page_settings enable row level security;

create policy "Blog page settings are publicly readable"
  on public.blog_page_settings for select
  using (true);

create policy "Blog page settings are admin writable"
  on public.blog_page_settings for all
  using (true)
  with check (true);

create policy "Studio page settings are publicly readable"
  on public.studio_page_settings for select
  using (true);

create policy "Studio page settings are admin writable"
  on public.studio_page_settings for all
  using (true)
  with check (true);
