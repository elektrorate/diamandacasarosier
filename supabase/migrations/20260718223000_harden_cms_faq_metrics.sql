-- Completa RLS para tablas creadas despues del baseline y agrega indices para metricas del dashboard.

alter table if exists public.page_faq_sections enable row level security;
alter table if exists public.page_faq_items enable row level security;
alter table if exists public.faq_groups enable row level security;

drop policy if exists "authenticated_all_page_faq_sections" on public.page_faq_sections;
create policy "authenticated_all_page_faq_sections"
  on public.page_faq_sections
  for all
  to authenticated
  using (public.is_authenticated())
  with check (public.is_authenticated());

drop policy if exists "authenticated_all_page_faq_items" on public.page_faq_items;
create policy "authenticated_all_page_faq_items"
  on public.page_faq_items
  for all
  to authenticated
  using (public.is_authenticated())
  with check (public.is_authenticated());

drop policy if exists "authenticated_all_faq_groups" on public.faq_groups;
create policy "authenticated_all_faq_groups"
  on public.faq_groups
  for all
  to authenticated
  using (public.is_authenticated())
  with check (public.is_authenticated());

create index if not exists idx_pages_status_deleted_at
  on public.pages (status, deleted_at);

create index if not exists idx_offerings_type_status
  on public.offerings (type, status);

create index if not exists idx_form_submissions_status_deleted
  on public.form_submissions (status, deleted_at);

create index if not exists idx_media_assets_folder_status
  on public.media_assets (folder, status);
