create table if not exists public.blog_page_settings (
  id text primary key,
  status text not null default 'published',
  hero jsonb not null default '{}'::jsonb,
  show_idea_prompt_section boolean not null default true,
  seo_title text not null default '',
  seo_description text not null default '',
  seo_image text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.blog_page_settings enable row level security;

drop policy if exists "Blog page settings are publicly readable" on public.blog_page_settings;
create policy "Blog page settings are publicly readable"
  on public.blog_page_settings for select
  using (true);

drop policy if exists "Blog page settings are admin writable" on public.blog_page_settings;
create policy "Blog page settings are admin writable"
  on public.blog_page_settings for all
  using (true)
  with check (true);
