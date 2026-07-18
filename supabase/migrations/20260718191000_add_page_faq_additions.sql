alter table if exists public.studio_page_settings
  add column if not exists show_faq_section boolean not null default false,
  add column if not exists faq_category text not null default 'general';

alter table if exists public.blog_page_settings
  add column if not exists show_faq_section boolean not null default false,
  add column if not exists faq_category text not null default 'general';

alter table if exists public.studio_page_settings
  drop constraint if exists studio_page_settings_faq_category_check;

alter table if exists public.blog_page_settings
  drop constraint if exists blog_page_settings_faq_category_check;

alter table if exists public.studio_page_settings
  add constraint studio_page_settings_faq_category_check
  check (faq_category in ('all', 'general', 'classes', 'shop', 'booking'));

alter table if exists public.blog_page_settings
  add constraint blog_page_settings_faq_category_check
  check (faq_category in ('all', 'general', 'classes', 'shop', 'booking'));