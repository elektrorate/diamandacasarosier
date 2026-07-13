-- 007 — Marketing Module: campaigns, events, analytics, GSC, SEO
-- Depende de: 001_phase1_cms.sql (usa set_updated_at_trigger, RLS helper)

-- ── Helper: updated_at trigger ──
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.set_updated_at_trigger(tbl text)
returns void as $$
begin
  execute format('drop trigger if exists set_updated_at on public.%I;', tbl);
  execute format(
    'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
    tbl
  );
end;
$$ language plpgsql;

-- ── 1. marketing_campaigns (UTM campaigns) ──
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text not null,
  utm_content text,
  utm_term text,
  destination_url text not null,
  generated_url text not null,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft','active','paused','finished','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 2. marketing_event_types (configurable events) ──
create table if not exists public.marketing_event_types (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  label text not null,
  description text,
  category text,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 3. marketing_event_logs ──
create table if not exists public.marketing_event_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.marketing_event_types(id) on delete set null,
  event_name text not null,
  page_url text,
  page_title text,
  content_type text,
  content_id uuid,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  source text,
  medium text,
  device text,
  country text,
  city text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ── 4. marketing_page_metrics ──
create table if not exists public.marketing_page_metrics (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  page_title text,
  content_type text,
  content_id uuid,
  date date not null,
  views integer not null default 0,
  active_users integer not null default 0,
  new_users integer not null default 0,
  sessions integer not null default 0,
  engagement_rate numeric,
  average_engagement_time numeric,
  bounce_rate numeric,
  conversions integer not null default 0,
  cta_clicks integer not null default 0,
  whatsapp_clicks integer not null default 0,
  form_submissions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketing_page_metrics_path_date on public.marketing_page_metrics(page_path, date);

-- ── 5. marketing_traffic_sources ──
create table if not exists public.marketing_traffic_sources (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  source text,
  medium text,
  campaign text,
  sessions integer not null default 0,
  users integer not null default 0,
  new_users integer not null default 0,
  conversions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 6. marketing_conversions ──
create table if not exists public.marketing_conversions (
  id uuid primary key default gen_random_uuid(),
  conversion_type text not null,
  page_url text,
  page_title text,
  content_type text,
  content_id uuid,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  source text,
  medium text,
  value numeric,
  currency text not null default 'EUR',
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ── 7. marketing_reports ──
create table if not exists public.marketing_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('weekly','monthly','campaign','page','seo','conversion')),
  date_from date,
  date_to date,
  file_url text,
  status text not null default 'pending' check (status in ('pending','generating','ready','failed')),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 8. marketing_search_console_queries ──
create table if not exists public.marketing_search_console_queries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  query text not null,
  page text,
  country text,
  device text,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric,
  position numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sc_queries_date on public.marketing_search_console_queries(date);
create index if not exists idx_sc_queries_query on public.marketing_search_console_queries(query);

-- ── 9. marketing_search_console_pages ──
create table if not exists public.marketing_search_console_pages (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  page text not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric,
  position numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sc_pages_page_date on public.marketing_search_console_pages(page, date);

-- ── 10. marketing_search_console_summary ──
create table if not exists public.marketing_search_console_summary (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  total_clicks integer not null default 0,
  total_impressions integer not null default 0,
  average_ctr numeric,
  average_position numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 11. marketing_seo_audit ──
create table if not exists public.marketing_seo_audit (
  id uuid primary key default gen_random_uuid(),
  page_url text not null unique,
  page_title text,
  content_type text,
  meta_title text,
  meta_description text,
  og_image text,
  canonical_url text,
  is_indexable boolean not null default true,
  has_meta_title boolean not null default false,
  has_meta_description boolean not null default false,
  has_og_image boolean not null default false,
  has_canonical boolean not null default false,
  slug_status text default 'ok' check (slug_status in ('ok','duplicate','missing','too_long','review')),
  seo_status text not null default 'pending' check (seo_status in ('ok','incomplete','review','error','pending')),
  issues jsonb,
  recommendations jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Triggers updated_at ──
select public.set_updated_at_trigger('marketing_campaigns');
select public.set_updated_at_trigger('marketing_event_types');
select public.set_updated_at_trigger('marketing_event_logs');
select public.set_updated_at_trigger('marketing_page_metrics');
select public.set_updated_at_trigger('marketing_traffic_sources');
select public.set_updated_at_trigger('marketing_conversions');
select public.set_updated_at_trigger('marketing_reports');
select public.set_updated_at_trigger('marketing_search_console_queries');
select public.set_updated_at_trigger('marketing_search_console_pages');
select public.set_updated_at_trigger('marketing_search_console_summary');
select public.set_updated_at_trigger('marketing_seo_audit');

-- ── RLS ──
do $$ declare tbl text;
begin
  foreach tbl in array array[
    'marketing_campaigns','marketing_event_types','marketing_event_logs',
    'marketing_page_metrics','marketing_traffic_sources','marketing_conversions',
    'marketing_reports','marketing_search_console_queries',
    'marketing_search_console_pages','marketing_search_console_summary','marketing_seo_audit'
  ] loop
    execute format('alter table public.%I enable row level security;', tbl);
    execute format(
      'drop policy if exists "authenticated_all_%I" on public.%I;',
      tbl, tbl
    );
    execute format(
      $p$ create policy "authenticated_all_%I" on public.%I
        for all to authenticated using (true) with check (true); $p$,
      tbl, tbl
    );
  end loop;
end $$;

-- ── Seed: default event types ──
insert into public.marketing_event_types (name, label, category, description) values
  ('click_whatsapp', 'Click WhatsApp', 'conversion', 'Usuario hizo clic en un botón de WhatsApp'),
  ('click_reservar', 'Click Reservar', 'conversion', 'Usuario hizo clic en botón de reserva'),
  ('click_comprar', 'Click Comprar', 'conversion', 'Usuario hizo clic en botón de compra'),
  ('submit_formulario', 'Envío de formulario', 'conversion', 'Usuario envió un formulario'),
  ('click_instagram', 'Click Instagram', 'engagement', 'Usuario hizo clic en enlace a Instagram'),
  ('click_email', 'Click Email', 'engagement', 'Usuario hizo clic en dirección de email'),
  ('click_external_link', 'Click Enlace Externo', 'navigation', 'Usuario hizo clic en un enlace externo'),
  ('view_workshop', 'Vista Workshop', 'content', 'Usuario visitó página de workshop'),
  ('view_class', 'Vista Clase', 'content', 'Usuario visitó página de clase'),
  ('view_gift_card', 'Vista Gift Card', 'content', 'Usuario visitó página de gift card'),
  ('view_product', 'Vista Producto', 'commerce', 'Usuario visitó página de producto'),
  ('view_blog_post', 'Vista Blog Post', 'content', 'Usuario visitó un post de la bitácora')
on conflict (name) do nothing;

-- ── Seed: single marketing_settings row if not exists ──
insert into public.marketing_settings (id, analytics_enabled)
select '00000000-0000-0000-0000-000000000002', false
where not exists (select 1 from public.marketing_settings limit 1)
on conflict (id) do nothing;
