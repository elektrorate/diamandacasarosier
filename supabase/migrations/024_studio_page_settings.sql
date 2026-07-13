create table if not exists public.studio_page_settings (
  id text primary key,
  status text not null default 'published',
  hero jsonb not null default '{}'::jsonb,
  intro_content text not null default '',
  show_idea_prompt_section boolean not null default true,
  seo_title text not null default '',
  seo_description text not null default '',
  seo_image text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.studio_page_settings enable row level security;

drop policy if exists "Studio page settings are publicly readable" on public.studio_page_settings;
create policy "Studio page settings are publicly readable"
  on public.studio_page_settings for select
  using (true);

drop policy if exists "Studio page settings are admin writable" on public.studio_page_settings;
create policy "Studio page settings are admin writable"
  on public.studio_page_settings for all
  using (true)
  with check (true);
