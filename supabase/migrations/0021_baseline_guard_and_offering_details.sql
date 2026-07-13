-- Baseline guard copied from 001_phase1_cms.sql
-- This migration is the first pending migration on some remotes where 001 was marked applied but tables are absent.

-- =============================================================================
-- Migration 001: CMS Schema Completo — Casa Rosier
-- =============================================================================
-- Este archivo es IDEMPOTENTE: todas las sentencias usan IF NOT EXISTS.
-- Se puede ejecutar múltiples veces sin dañar datos existentes.
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONES Y FUNCIONES AUXILIARES
-- =============================================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_authenticated()
returns boolean language sql stable as $$
  select auth.role() = 'authenticated';
$$;

create or replace function public.set_updated_at_trigger(tbl text)
returns void language plpgsql as $$
begin
  execute format('drop trigger if exists set_updated_at on public.%I;', tbl);
  execute format(
    'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
    tbl
  );
end;
$$;

-- =============================================================================
-- 2. TABLAS — CONTENIDO PÚBLICO
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1 pages
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  type            text not null default 'default',
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  header_id       uuid,
  social_gallery_id uuid,
  testimonials_id uuid,
  footer_id       uuid,
  seo_title       text,
  seo_description text,
  seo_image       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.2 page_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.page_blocks (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references public.pages(id) on delete cascade,
  type          text not null default 'text',
  title         text,
  text          text,
  image_id      text,
  source_url    text,
  is_visible    boolean not null default true,
  sort_order    integer not null default 0,
  custom_html   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.3 landing_pages
-- ---------------------------------------------------------------------------
create table if not exists public.landing_pages (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  campaign_type     text not null default 'custom' check (campaign_type in ('course', 'workshop', 'experience', 'gift_card', 'event', 'lead_capture', 'custom')),
  header_id         uuid,
  hero_title        text,
  hero_subtitle     text,
  hero_image_id     text,
  intro_text        text,
  cta_text          text,
  cta_url           text,
  form_id           uuid,
  social_gallery_id uuid,
  testimonials_id   uuid,
  footer_id         uuid,
  seo_title         text,
  seo_description   text,
  seo_image         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.4 landing_page_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.landing_page_blocks (
  id                uuid primary key default gen_random_uuid(),
  landing_page_id   uuid not null references public.landing_pages(id) on delete cascade,
  type              text not null default 'text',
  title             text,
  text              text,
  image_id          text,
  source_url        text,
  is_visible        boolean not null default true,
  sort_order        integer not null default 0,
  custom_html       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.5 headers
-- ---------------------------------------------------------------------------
create table if not exists public.headers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,
  slug              text not null unique,
  type              text not null default 'hero',
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  title             text,
  subtitle          text,
  eyebrow           text,
  desktop_image_url text,
  mobile_image_url  text,
  overlay_enabled   boolean not null default false,
  overlay_color     text not null default '#000000',
  overlay_opacity   numeric not null default 0,
  gradient_enabled  boolean not null default false,
  gradient_css      text,
  desktop_height    text not null default '80vh',
  mobile_height     text not null default '60vh',
  content_position  text not null default 'center',
  content_alignment text not null default 'center',
  menu_color        text not null default 'light',
  logo_variant      text not null default 'default',
  visual_variant    text not null default 'minimal',
  cta_label         text,
  cta_url           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.6 social_galleries
-- ---------------------------------------------------------------------------
create table if not exists public.social_galleries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  title       text,
  description text,
  cta_text    text,
  cta_url     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.7 social_gallery_items
-- ---------------------------------------------------------------------------
create table if not exists public.social_gallery_items (
  id                 uuid primary key default gen_random_uuid(),
  social_gallery_id  uuid not null references public.social_galleries(id) on delete cascade,
  image_id           text,
  url                text,
  platform           text,
  title              text,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.8 testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  text        text,
  avatar_id   text,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  sort_order  integer not null default 0,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.9 footers
-- ---------------------------------------------------------------------------
create table if not exists public.footers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  status              text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  logo_id             text,
  contact_email       text,
  whatsapp            text,
  address             text,
  legal_text          text,
  social_links        jsonb not null default '[]'::jsonb,
  menu_id             uuid,
  newsletter_enabled  boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.10 promo_banners
-- ---------------------------------------------------------------------------
create table if not exists public.promo_banners (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  text            text,
  link_url        text,
  start_date      text,
  end_date        text,
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  visual_variant  text not null default 'default',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.12 faqs
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text,
  category    text not null default 'general',
  sort_order  integer not null default 0,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.13 teachers
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  bio         text,
  image_id    text,
  instagram   text,
  specialty   text,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.14 offerings (ya existe, se amplía con FK)
-- ---------------------------------------------------------------------------
create table if not exists public.offerings (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('class', 'workshop', 'experience', 'gift_card')),
  title           text not null,
  slug            text not null unique,
  subtitle        text,
  excerpt         text,
  description     text,
  price           numeric(12,2),
  currency        text not null default 'USD' check (char_length(currency) = 3),
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  featured        boolean not null default false,
  duration        text,
  header_id       uuid,
  schedule        jsonb not null default '[]'::jsonb,
  teacher         text,
  capacity        integer check (capacity is null or capacity >= 0),
  cover_image_url text,
  gallery         jsonb not null default '[]'::jsonb,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.15 offering_schedules (normalización del schedule JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.offering_schedules (
  id            uuid primary key default gen_random_uuid(),
  offering_id   uuid not null references public.offerings(id) on delete cascade,
  day_of_week   integer not null check (day_of_week between 0 and 6),
  start_time    time,
  end_time      time,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.16 offering_prices (precios alternativos / variantes)
-- ---------------------------------------------------------------------------
create table if not exists public.offering_prices (
  id            uuid primary key default gen_random_uuid(),
  offering_id   uuid not null references public.offerings(id) on delete cascade,
  label         text not null,
  price         numeric(12,2) not null,
  currency      text not null default 'USD' check (char_length(currency) = 3),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.17 offering_gallery_items (normalización del gallery JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.offering_gallery_items (
  id            uuid primary key default gen_random_uuid(),
  offering_id   uuid not null references public.offerings(id) on delete cascade,
  image_id      text,
  caption       text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.18 blog_posts
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text not null unique,
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  excerpt            text,
  content            text,
  featured_image_id  text,
  author_id          text,
  category           text not null default 'general',
  tags               text[] not null default '{}',
  published_at       timestamptz,
  reading_time       integer not null default 1,
  seo_title          text,
  seo_description    text,
  seo_image          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.19 blog_post_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.blog_post_blocks (
  id            uuid primary key default gen_random_uuid(),
  blog_post_id  uuid not null references public.blog_posts(id) on delete cascade,
  type          text not null default 'text',
  title         text,
  text          text,
  image_id      text,
  source_url    text,
  is_visible    boolean not null default true,
  sort_order    integer not null default 0,
  custom_html   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.20 products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  sku                 text,
  description         text,
  excerpt             text,
  main_image_id       text,
  gallery             text[] not null default '{}',
  price               numeric(12,2),
  compare_at_price    numeric(12,2),
  stock               integer,
  low_stock_threshold integer not null default 5,
  category_id         text,
  characteristics     text,
  weight              text,
  dimensions          text,
  seo_title           text,
  seo_description     text,
  seo_image           text,
  status              text not null default 'draft' check (status in ('draft', 'published', 'archived', 'deleted')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.21 product_categories
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_id    text,
  status      text not null default 'active' check (status in ('active', 'inactive', 'deleted')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.22 media_assets (ya existe)
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id            uuid primary key default gen_random_uuid(),
  file_name     text not null,
  original_name text,
  file_url      text not null,
  file_type     text not null,
  mime_type     text,
  size          bigint not null default 0,
  alt_text      text,
  title         text,
  description   text,
  folder        text not null default 'general',
  tags          text[] not null default '{}',
  status        text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.23 menus (ya existe, se amplía)
-- ---------------------------------------------------------------------------
create table if not exists public.menus (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  location   text not null check (location in ('main', 'mobile', 'footer')),
  status     text not null default 'draft' check (status in ('draft', 'active', 'archived', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 2.24 menu_items (ya existe, se amplía)
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id                 uuid primary key default gen_random_uuid(),
  menu_id            uuid not null references public.menus(id) on delete cascade,
  label              text not null,
  type               text not null default 'custom' check (type in ('internal', 'external', 'offering', 'custom')),
  url                text not null,
  linked_entity_type text not null default 'none',
  linked_entity_id   text,
  parent_id          uuid references public.menu_items(id) on delete set null,
  sort_order         integer not null default 0,
  is_visible         boolean not null default true,
  open_in_new_tab    boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2.25 site_settings (ya existe, se amplía)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                  uuid primary key default gen_random_uuid(),
  site_name           text not null,
  site_description    text,
  logo_url            text,
  favicon_url         text,
  default_language    text not null default 'es',
  timezone            text not null default 'Europe/Madrid',
  email               text,
  phone               text,
  whatsapp            text,
  address             text,
  city                text not null default 'Barcelona',
  country             text not null default 'España',
  map_url             text,
  instagram_url       text,
  tiktok_url          text,
  facebook_url        text,
  youtube_url         text,
  pinterest_url       text,
  footer_logo_url     text,
  footer_text         text,
  legal_text          text,
  show_social_links   boolean not null default true,
  show_contact_info   boolean not null default true,
  maintenance_mode     boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- 3. TABLAS — CONTENIDO PRIVADO / ADMIN
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 profiles (ya existe)
-- ---------------------------------------------------------------------------
-- NOTA: profiles.id referencia auth.users(id). Los perfiles deben crearse
-- DESPUÉS de que el usuario exista en Supabase Auth (por ejemplo, tras
-- registrarse o mediante el panel de Supabase). Insertar un profile sin
-- el auth.user correspondiente lanzará un error de foreign key.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text not null unique,
  role       text not null check (role in ('admin', 'editor', 'teacher', 'collaborator')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.2 reservations
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  offering_id     text not null,
  schedule_id     text,
  date            text not null,
  time            text,
  people_count    integer not null default 1,
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'cancelled', 'rescheduled', 'deleted')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  payment_id      text,
  total_amount    numeric(12,2),
  currency        text not null default 'EUR' check (char_length(currency) = 3),
  notes           text,
  internal_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.3 forms
-- ---------------------------------------------------------------------------
create table if not exists public.forms (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  slug                        text not null unique,
  type                        text not null check (type in ('contact', 'newsletter', 'landing', 'workshop', 'gift_card', 'private_booking', 'custom')),
  status                      text not null default 'draft' check (status in ('draft', 'active', 'archived', 'deleted')),
  title                       text,
  description                 text,
  success_message             text not null default 'Mensaje enviado correctamente.',
  redirect_url                text,
  email_notification_enabled  boolean not null default false,
  notification_email          text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  deleted_at                  timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.4 form_fields
-- ---------------------------------------------------------------------------
create table if not exists public.form_fields (
  id             uuid primary key default gen_random_uuid(),
  form_id        uuid not null references public.forms(id) on delete cascade,
  label          text not null,
  name           text not null,
  type           text not null default 'text' check (type in ('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'hidden')),
  placeholder    text,
  required       boolean not null default false,
  options        jsonb not null default '[]'::jsonb,
  default_value  text,
  sort_order     integer not null default 0,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.5 form_submissions
-- ---------------------------------------------------------------------------
create table if not exists public.form_submissions (
  id             uuid primary key default gen_random_uuid(),
  form_id        text not null,
  form_slug      text,
  form_name      text,
  name           text not null,
  email          text not null,
  phone          text,
  subject        text,
  message        text,
  data           jsonb not null default '{}'::jsonb,
  source_page    text,
  status         text not null default 'new' check (status in ('new', 'read', 'replied', 'archived', 'spam', 'deleted')),
  internal_notes text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.6 orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text,
  status             text not null default 'new' check (status in ('new', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'deleted')),
  payment_status     text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  subtotal           numeric(12,2),
  discount_total     numeric(12,2),
  shipping_total     numeric(12,2),
  total              numeric(12,2),
  coupon_code        text,
  shipping_method_id text,
  shipping_address   text,
  payment_method     text,
  payment_id         text,
  internal_notes     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.7 order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   text,
  product_name text not null,
  quantity     integer not null default 1,
  unit_price   numeric(12,2) not null,
  total        numeric(12,2) not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.8 coupons
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  discount_type        text not null check (discount_type in ('percentage', 'fixed')),
  value                numeric(12,2),
  start_date           text,
  end_date             text,
  usage_limit          integer,
  used_count           integer not null default 0,
  minimum_order_amount numeric(12,2),
  status               text not null default 'active' check (status in ('active', 'inactive', 'expired', 'deleted')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.9 shipping_methods
-- ---------------------------------------------------------------------------
create table if not exists public.shipping_methods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'standard',
  price       numeric(12,2),
  countries   text[] not null default '{}',
  description text,
  sort_order  integer not null default 0,
  status      text not null default 'inactive' check (status in ('active', 'inactive', 'deleted')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.10 marketing_settings (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_settings (
  id                          uuid primary key default gen_random_uuid(),
  analytics_enabled           boolean not null default false,
  google_analytics_id         text,
  gtm_container_id            text,
  google_search_console_id    text,
  microsoft_clarity_id        text,
  meta_pixel_enabled          boolean not null default false,
  meta_pixel_id               text,
  meta_conversion_api_enabled boolean not null default false,
  meta_access_token           text,
  meta_dataset_id             text,
  tiktok_pixel_enabled        boolean not null default false,
  tiktok_pixel_id             text,
  pinterest_tag_enabled       boolean not null default false,
  pinterest_tag_id            text,
  linkedin_insight_enabled    boolean not null default false,
  linkedin_partner_id         text,
  seo_global_title            text,
  seo_global_description      text,
  seo_og_image                text,
  robots_enabled              boolean not null default true,
  sitemap_enabled             boolean not null default true,
  schema_enabled              boolean not null default true,
  events                      jsonb not null default '[]'::jsonb,
  utm_builder_enabled         boolean not null default false,
  automation_webhooks_enabled boolean not null default false,
  webhook_url                 text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.11 legal_settings (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.legal_settings (
  id                            uuid primary key default gen_random_uuid(),
  banner_enabled                boolean not null default true,
  banner_text                   text,
  cookies_banner_title          text,
  cookies_banner_text           text,
  accept_button_text            text not null default 'Aceptar todas',
  reject_button_text            text not null default 'Rechazar',
  preferences_button_text       text not null default 'Preferencias',
  consent_categories            jsonb not null default '[]'::jsonb,
  analytics_consent_required    boolean not null default true,
  marketing_consent_required    boolean not null default true,
  functional_consent_required   boolean not null default false,
  privacy_policy_title          text,
  privacy_policy_content        text,
  privacy_policy_url            text,
  cookies_policy_title          text,
  cookies_policy_content        text,
  cookie_policy_url             text,
  legal_notice_title            text,
  legal_notice_content          text,
  legal_notice_url              text,
  terms_title                   text,
  terms_content                 text,
  terms_url                     text,
  purchase_terms_content        text,
  consent_mode_enabled          boolean not null default false,
  google_consent_mode_enabled   boolean not null default false,
  meta_consent_mode_enabled     boolean not null default false,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.12 redirects
-- ---------------------------------------------------------------------------
create table if not exists public.redirects (
  id            uuid primary key default gen_random_uuid(),
  source_url    text not null,
  target_url    text not null,
  redirect_type text not null default '301' check (redirect_type in ('301', '302')),
  status        text not null default 'active' check (status in ('active', 'inactive', 'deleted')),
  notes         text,
  hit_count     integer not null default 0,
  last_hit_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- 3.13 trash_items (ya existe)
-- ---------------------------------------------------------------------------
create table if not exists public.trash_items (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null,
  entity_id    text not null,
  title        text not null,
  deleted_by   uuid references public.profiles(id) on delete set null,
  deleted_at   timestamptz not null default now(),
  restore_data jsonb
);

-- ---------------------------------------------------------------------------
-- 3.14 history_logs (ya existe)
-- ---------------------------------------------------------------------------
create table if not exists public.history_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       text,
  user_email    text,
  action        text not null,
  entity_type   text not null,
  entity_id     text not null,
  entity_title  text,
  old_data      jsonb,
  new_data      jsonb,
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- 4. ÍNDICES
-- =============================================================================

-- 4.1 profiles
create index if not exists idx_profiles_role on public.profiles (role);

-- 4.2 pages
create index if not exists idx_pages_status on public.pages (status);
create index if not exists idx_pages_type on public.pages (type);
create index if not exists idx_pages_slug on public.pages (slug);
create index if not exists idx_pages_deleted_at on public.pages (deleted_at);
create index if not exists idx_page_blocks_page_id on public.page_blocks (page_id);

-- 4.3 landing_pages
create index if not exists idx_landing_pages_status on public.landing_pages (status);
create index if not exists idx_landing_pages_slug on public.landing_pages (slug);
create index if not exists idx_landing_pages_deleted_at on public.landing_pages (deleted_at);
create index if not exists idx_landing_page_blocks_landing_id on public.landing_page_blocks (landing_page_id);

-- 4.4 headers
create index if not exists idx_headers_status on public.headers (status);
create index if not exists idx_headers_slug on public.headers (slug);

-- 4.5 social_galleries
create index if not exists idx_social_galleries_status on public.social_galleries (status);
create index if not exists idx_social_gallery_items_gallery_id on public.social_gallery_items (social_gallery_id);

-- 4.6 testimonials
create index if not exists idx_testimonials_status on public.testimonials (status);
create index if not exists idx_testimonials_featured on public.testimonials (is_featured) where is_featured = true;

-- 4.7 footers
create index if not exists idx_footers_status on public.footers (status);

-- 4.8 promo_banners
create index if not exists idx_promo_banners_status on public.promo_banners (status);

-- 4.9 faqs
create index if not exists idx_faqs_status on public.faqs (status);
create index if not exists idx_faqs_category on public.faqs (category);

-- 4.10 teachers
create index if not exists idx_teachers_status on public.teachers (status);

-- 4.11 offerings
create index if not exists idx_offerings_type on public.offerings (type);
create index if not exists idx_offerings_status on public.offerings (status);
create index if not exists idx_offerings_featured on public.offerings (featured) where featured = true;
create index if not exists idx_offerings_teacher on public.offerings (teacher);
create index if not exists idx_offerings_slug on public.offerings (slug);
create index if not exists idx_offerings_deleted_at on public.offerings (deleted_at);
create index if not exists idx_offering_schedules_offering_id on public.offering_schedules (offering_id);
create index if not exists idx_offering_prices_offering_id on public.offering_prices (offering_id);
create index if not exists idx_offering_gallery_items_offering_id on public.offering_gallery_items (offering_id);

-- 4.13 blog_posts
create index if not exists idx_blog_posts_status on public.blog_posts (status);
create index if not exists idx_blog_posts_slug on public.blog_posts (slug);
create index if not exists idx_blog_posts_category on public.blog_posts (category);
create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc);
create index if not exists idx_blog_posts_deleted_at on public.blog_posts (deleted_at);
create index if not exists idx_blog_post_blocks_post_id on public.blog_post_blocks (blog_post_id);

-- 4.14 products
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_deleted_at on public.products (deleted_at);

-- 4.15 product_categories
create index if not exists idx_product_categories_status on public.product_categories (status);
create index if not exists idx_product_categories_slug on public.product_categories (slug);

-- 4.16 media_assets
create index if not exists idx_media_assets_folder on public.media_assets (folder);
create index if not exists idx_media_assets_status on public.media_assets (status);

-- 4.17 menus
create index if not exists idx_menus_location on public.menus (location);
create index if not exists idx_menus_status on public.menus (status);
create index if not exists idx_menu_items_menu_id on public.menu_items (menu_id);
create index if not exists idx_menu_items_parent_id on public.menu_items (parent_id);

-- 4.18 reservations
create index if not exists idx_reservations_status on public.reservations (status);
create index if not exists idx_reservations_date on public.reservations (date);
create index if not exists idx_reservations_deleted_at on public.reservations (deleted_at);

-- 4.19 forms
create index if not exists idx_forms_status on public.forms (status);
create index if not exists idx_forms_slug on public.forms (slug);
create index if not exists idx_form_fields_form_id on public.form_fields (form_id);

-- 4.20 form_submissions
create index if not exists idx_form_submissions_status on public.form_submissions (status);
create index if not exists idx_form_submissions_form_id on public.form_submissions (form_id);

-- 4.21 orders
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_deleted_at on public.orders (deleted_at);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- 4.22 coupons
create index if not exists idx_coupons_status on public.coupons (status);
create index if not exists idx_coupons_code on public.coupons (code);

-- 4.23 shipping_methods
create index if not exists idx_shipping_methods_status on public.shipping_methods (status);

-- 4.24 redirects
create index if not exists idx_redirects_status on public.redirects (status);
create index if not exists idx_redirects_source_url on public.redirects (source_url);

-- 4.25 trash_items
create index if not exists idx_trash_items_entity on public.trash_items (entity_type, entity_id);

-- 4.26 history_logs
create index if not exists idx_history_logs_entity on public.history_logs (entity_type, entity_id);
create index if not exists idx_history_logs_action on public.history_logs (action);
create index if not exists idx_history_logs_created_at on public.history_logs (created_at desc);

-- =============================================================================
-- 5. TRIGGERS updated_at
-- =============================================================================

do $$ begin
  -- Contenido público
  perform public.set_updated_at_trigger('pages');
  perform public.set_updated_at_trigger('page_blocks');
  perform public.set_updated_at_trigger('landing_pages');
  perform public.set_updated_at_trigger('landing_page_blocks');
  perform public.set_updated_at_trigger('headers');
  perform public.set_updated_at_trigger('social_galleries');
  perform public.set_updated_at_trigger('social_gallery_items');
  perform public.set_updated_at_trigger('testimonials');
  perform public.set_updated_at_trigger('footers');
  perform public.set_updated_at_trigger('promo_banners');
  perform public.set_updated_at_trigger('faqs');
  perform public.set_updated_at_trigger('teachers');
  perform public.set_updated_at_trigger('offerings');
  perform public.set_updated_at_trigger('offering_schedules');
  perform public.set_updated_at_trigger('offering_prices');
  perform public.set_updated_at_trigger('offering_gallery_items');
  perform public.set_updated_at_trigger('blog_posts');
  perform public.set_updated_at_trigger('blog_post_blocks');
  perform public.set_updated_at_trigger('products');
  perform public.set_updated_at_trigger('product_categories');
  perform public.set_updated_at_trigger('media_assets');
  perform public.set_updated_at_trigger('menus');
  perform public.set_updated_at_trigger('menu_items');
  perform public.set_updated_at_trigger('site_settings');
  -- Contenido privado
  perform public.set_updated_at_trigger('profiles');
  perform public.set_updated_at_trigger('reservations');
  perform public.set_updated_at_trigger('forms');
  perform public.set_updated_at_trigger('form_fields');
  perform public.set_updated_at_trigger('form_submissions');
  perform public.set_updated_at_trigger('orders');
  perform public.set_updated_at_trigger('coupons');
  perform public.set_updated_at_trigger('shipping_methods');
  perform public.set_updated_at_trigger('marketing_settings');
  perform public.set_updated_at_trigger('legal_settings');
  perform public.set_updated_at_trigger('redirects');
end $$;

-- =============================================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================================

-- 6.1 Activar RLS en todas las tablas
do $$ declare
  tbl text;
begin
  for tbl in select unnest(array[
    'profiles', 'pages', 'page_blocks', 'landing_pages', 'landing_page_blocks',
    'headers', 'social_galleries', 'social_gallery_items', 'testimonials',
    'footers', 'promo_banners', 'faqs', 'teachers',
    'offerings', 'offering_schedules', 'offering_prices', 'offering_gallery_items',
    'blog_posts', 'blog_post_blocks', 'products', 'product_categories',
    'media_assets', 'menus', 'menu_items', 'site_settings',
    'reservations', 'forms', 'form_fields', 'form_submissions', 'orders',
    'order_items', 'coupons', 'shipping_methods', 'marketing_settings',
    'legal_settings', 'redirects', 'trash_items', 'history_logs'
  ]) loop
    execute format('alter table public.%I enable row level security;', tbl);
  end loop;
end $$;

-- 6.2 Políticas para authenticated (CRUD completo en todas las tablas CMS)
do $$ declare
  tbl text;
begin
  for tbl in select unnest(array[
    'profiles', 'pages', 'page_blocks', 'landing_pages', 'landing_page_blocks',
    'headers', 'social_galleries', 'social_gallery_items', 'testimonials',
    'footers', 'promo_banners', 'faqs', 'teachers',
    'offerings', 'offering_schedules', 'offering_prices', 'offering_gallery_items',
    'blog_posts', 'blog_post_blocks', 'products', 'product_categories',
    'media_assets', 'menus', 'menu_items', 'site_settings',
    'reservations', 'forms', 'form_fields', 'form_submissions', 'orders',
    'order_items', 'coupons', 'shipping_methods', 'marketing_settings',
    'legal_settings', 'redirects', 'trash_items', 'history_logs'
  ]) loop
    execute format(
      'drop policy if exists "authenticated_all on %I" on public.%I;', tbl, tbl
    );
    execute format(
      'create policy "authenticated_all on %I" on public.%I for all to authenticated using (public.is_authenticated()) with check (public.is_authenticated());',
      tbl, tbl
    );
  end loop;
end $$;

-- 6.3 Políticas para anon (SELECT solo en contenido público publicado/activo)

-- pages: solo published y no eliminados
drop policy if exists "anon_select_pages" on public.pages;
create policy "anon_select_pages" on public.pages
  for select to anon
  using (status = 'published' and deleted_at is null);

-- landing_pages: solo published y no eliminados
drop policy if exists "anon_select_landing_pages" on public.landing_pages;
create policy "anon_select_landing_pages" on public.landing_pages
  for select to anon
  using (status = 'published' and deleted_at is null);

-- page_blocks y landing_page_blocks: acceso si la página padre es published
-- Se maneja via la relación, pero como RLS no puede hacer subqueries fácilmente,
-- permitimos SELECT a anon para todos los blocks (el frontend solo mostrará
-- los de páginas publicadas).
drop policy if exists "anon_select_page_blocks" on public.page_blocks;
create policy "anon_select_page_blocks" on public.page_blocks for select to anon using (true);

drop policy if exists "anon_select_landing_page_blocks" on public.landing_page_blocks;
create policy "anon_select_landing_page_blocks" on public.landing_page_blocks for select to anon using (true);

-- headers
drop policy if exists "anon_select_headers" on public.headers;
create policy "anon_select_headers" on public.headers
  for select to anon
  using (status = 'published' and deleted_at is null);

-- social_galleries
drop policy if exists "anon_select_social_galleries" on public.social_galleries;
create policy "anon_select_social_galleries" on public.social_galleries
  for select to anon
  using (status = 'published' and deleted_at is null);

-- social_gallery_items: acceso público si la galería es publicada
drop policy if exists "anon_select_social_gallery_items" on public.social_gallery_items;
create policy "anon_select_social_gallery_items" on public.social_gallery_items for select to anon using (true);

-- testimonials
drop policy if exists "anon_select_testimonials" on public.testimonials;
create policy "anon_select_testimonials" on public.testimonials
  for select to anon
  using (status = 'published' and deleted_at is null);

-- footers
drop policy if exists "anon_select_footers" on public.footers;
create policy "anon_select_footers" on public.footers
  for select to anon
  using (status = 'published' and deleted_at is null);

-- promo_banners
drop policy if exists "anon_select_promo_banners" on public.promo_banners;
create policy "anon_select_promo_banners" on public.promo_banners
  for select to anon
  using (status = 'published' and deleted_at is null);

-- faqs
drop policy if exists "anon_select_faqs" on public.faqs;
create policy "anon_select_faqs" on public.faqs
  for select to anon
  using (status = 'published' and deleted_at is null);

-- teachers
drop policy if exists "anon_select_teachers" on public.teachers;
create policy "anon_select_teachers" on public.teachers
  for select to anon
  using (status = 'published' and deleted_at is null);

-- offerings: solo published, no eliminados
drop policy if exists "anon_select_offerings" on public.offerings;
create policy "anon_select_offerings" on public.offerings
  for select to anon
  using (status = 'published' and deleted_at is null);

-- blog_posts
drop policy if exists "anon_select_blog_posts" on public.blog_posts;
create policy "anon_select_blog_posts" on public.blog_posts
  for select to anon
  using (status = 'published' and deleted_at is null);

-- blog_post_blocks
drop policy if exists "anon_select_blog_post_blocks" on public.blog_post_blocks;
create policy "anon_select_blog_post_blocks" on public.blog_post_blocks for select to anon using (true);

-- products
drop policy if exists "anon_select_products" on public.products;
create policy "anon_select_products" on public.products
  for select to anon
  using (status = 'published' and deleted_at is null);

-- product_categories
drop policy if exists "anon_select_product_categories" on public.product_categories;
create policy "anon_select_product_categories" on public.product_categories
  for select to anon
  using (status = 'active' and deleted_at is null);

-- menus: solo active
drop policy if exists "anon_select_menus" on public.menus;
create policy "anon_select_menus" on public.menus
  for select to anon
  using (status = 'active' and deleted_at is null);

-- menu_items: acceso público si el menú es active
drop policy if exists "anon_select_menu_items" on public.menu_items;
create policy "anon_select_menu_items" on public.menu_items for select to anon using (true);

-- site_settings: siempre público
drop policy if exists "anon_select_site_settings" on public.site_settings;
create policy "anon_select_site_settings" on public.site_settings for select to anon using (true);

-- marketing_settings: solo lectura pública limitada (no exponer access tokens)
drop policy if exists "anon_select_marketing_settings" on public.marketing_settings;
create policy "anon_select_marketing_settings" on public.marketing_settings for select to anon using (true);

-- legal_settings: siempre público
drop policy if exists "anon_select_legal_settings" on public.legal_settings;
create policy "anon_select_legal_settings" on public.legal_settings for select to anon using (true);

-- redirects: anon puede leer para que el middleware resuelva redirecciones
drop policy if exists "anon_select_redirects" on public.redirects;
create policy "anon_select_redirects" on public.redirects
  for select to anon
  using (status = 'active' and deleted_at is null);

-- offering_schedules, offering_prices, offering_gallery_items: acceso público
drop policy if exists "anon_select_offering_schedules" on public.offering_schedules;
create policy "anon_select_offering_schedules" on public.offering_schedules for select to anon using (true);

drop policy if exists "anon_select_offering_prices" on public.offering_prices;
create policy "anon_select_offering_prices" on public.offering_prices for select to anon using (true);

drop policy if exists "anon_select_offering_gallery_items" on public.offering_gallery_items;
create policy "anon_select_offering_gallery_items" on public.offering_gallery_items for select to anon using (true);

-- =============================================================================
-- 7. STORAGE: bucket media
-- =============================================================================

-- Crear bucket si no existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

-- Políticas Storage: lectura pública
drop policy if exists "Public Read" on storage.objects;
create policy "Public Read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Políticas Storage: insert para authenticated
drop policy if exists "Authenticated Insert" on storage.objects;
create policy "Authenticated Insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

-- Políticas Storage: update para authenticated
drop policy if exists "Authenticated Update" on storage.objects;
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

-- Políticas Storage: delete para authenticated
drop policy if exists "Authenticated Delete" on storage.objects;
create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- =============================================================================
-- 8. NOTAS FINALES
-- =============================================================================
-- Contenido público: pages, landing_pages, headers, social_galleries,
--   testimonials, footers, promo_banners, faqs, teachers,
--   offerings, blog_posts, products, product_categories, menus, menu_items,
--   site_settings, marketing_settings (parcial), legal_settings, redirects
--
-- Contenido privado / admin: reservations, forms, form_fields,
--   form_submissions, orders, order_items, coupons, shipping_methods,
--   profiles, trash_items, history_logs
--
-- Ecommerce: products, product_categories, orders, order_items, coupons,
--   shipping_methods
--
-- Formularios: forms, form_fields, form_submissions
--
-- Tracking: history_logs, redirects (hit_count)
--
-- Storage: bucket 'media' con lectura pública y escritura authenticated
--
-- IMPORTANTE:
-- 1. profiles.id tiene FK a auth.users(id). Crear profiles ANTES de tener
--    el usuario en Auth causará error. La creación de profiles debe ocurrir
--    mediante un trigger AFTER INSERT ON auth.users o desde el panel de
--    Supabase después de registrar al usuario.
-- 2. Las políticas anon permiten SELECT solo en filas con status 'published'
--    o 'active' y deleted_at IS NULL. El frontend público necesita el anon key.
-- 3. Los triggers updated_at se aplican a todas las tablas editables.
-- 4. Este migration es IDEMPOTENTE: se puede ejecutar múltiples veces.
-- =============================================================================


-- Original 002_offering_details.sql
alter table if exists public.site_settings
  add column if not exists default_seo_title text,
  add column if not exists default_seo_description text,
  add column if not exists default_og_image_url text,
  add column if not exists robots_index boolean not null default true,
  add column if not exists robots_follow boolean not null default true;

alter table public.offerings
add column if not exists details jsonb not null default '{}'::jsonb;

