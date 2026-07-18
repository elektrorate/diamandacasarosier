create table if not exists public.page_faq_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null default '',
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id)
);

create table if not exists public.page_faq_items (
  id uuid primary key default gen_random_uuid(),
  faq_section_id uuid not null references public.page_faq_sections(id) on delete cascade,
  question text not null default '',
  answer text not null default '',
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_page_faq_sections_page_id on public.page_faq_sections(page_id);
create index if not exists idx_page_faq_items_section_position on public.page_faq_items(faq_section_id, position);

alter table public.page_faq_sections enable row level security;
alter table public.page_faq_items enable row level security;

drop policy if exists "anon_select_page_faq_sections" on public.page_faq_sections;
create policy "anon_select_page_faq_sections" on public.page_faq_sections
  for select
  to anon, authenticated
  using (
    is_enabled = true
    and exists (
      select 1 from public.pages
      where pages.id = page_faq_sections.page_id
        and pages.status = 'published'
        and pages.deleted_at is null
    )
  );

drop policy if exists "anon_select_page_faq_items" on public.page_faq_items;
create policy "anon_select_page_faq_items" on public.page_faq_items
  for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1
      from public.page_faq_sections
      join public.pages on pages.id = page_faq_sections.page_id
      where page_faq_sections.id = page_faq_items.faq_section_id
        and page_faq_sections.is_enabled = true
        and pages.status = 'published'
        and pages.deleted_at is null
    )
  );

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    perform public.set_updated_at_trigger('page_faq_sections');
    perform public.set_updated_at_trigger('page_faq_items');
  end if;
exception when others then
  null;
end $$;

-- Migracion conservadora: no elimina el modulo global existente.
-- Copia las FAQs globales publicadas a la pagina "el-estudio" solo si aun no hay FAQ personalizado en ninguna pagina.
insert into public.page_faq_sections (page_id, title, is_enabled)
select pages.id, 'Preguntas frecuentes', true
from public.pages
where pages.slug = 'el-estudio'
  and not exists (select 1 from public.page_faq_sections)
limit 1;

insert into public.page_faq_items (faq_section_id, question, answer, position, is_visible)
select page_faq_sections.id, faqs.question, faqs.answer, row_number() over (order by faqs.sort_order, faqs.question) - 1, true
from public.page_faq_sections
join public.pages on pages.id = page_faq_sections.page_id
join public.faqs on faqs.status = 'published' and faqs.deleted_at is null
where pages.slug = 'el-estudio'
  and not exists (
    select 1 from public.page_faq_items
    where page_faq_items.faq_section_id = page_faq_sections.id
  );