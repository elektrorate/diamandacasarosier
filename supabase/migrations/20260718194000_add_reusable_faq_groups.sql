create table if not exists public.faq_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table if exists public.faq_groups enable row level security;

alter table if exists public.faqs
  add column if not exists faq_group_id uuid references public.faq_groups(id) on delete set null,
  add column if not exists topic_title text not null default 'General';

alter table if exists public.studio_page_settings
  add column if not exists faq_group_id uuid references public.faq_groups(id) on delete set null;

alter table if exists public.blog_page_settings
  add column if not exists faq_group_id uuid references public.faq_groups(id) on delete set null;

insert into public.faq_groups (title, description, status, sort_order)
select 'Preguntas frecuentes', 'Informacion general para resolver dudas antes de reservar o participar.', 'published', 0
where not exists (
  select 1 from public.faq_groups where deleted_at is null and lower(title) = lower('Preguntas frecuentes')
);

update public.faqs
set faq_group_id = (select id from public.faq_groups where deleted_at is null and lower(title) = lower('Preguntas frecuentes') order by created_at asc limit 1),
    topic_title = coalesce(nullif(topic_title, ''), case category when 'classes' then 'Clases' when 'shop' then 'Shop' when 'booking' then 'Reservas' else 'General' end)
where faq_group_id is null;

update public.studio_page_settings
set faq_group_id = (select id from public.faq_groups where deleted_at is null and lower(title) = lower('Preguntas frecuentes') order by created_at asc limit 1)
where show_faq_section = true and faq_group_id is null;

update public.blog_page_settings
set faq_group_id = (select id from public.faq_groups where deleted_at is null and lower(title) = lower('Preguntas frecuentes') order by created_at asc limit 1)
where show_faq_section = true and faq_group_id is null;
