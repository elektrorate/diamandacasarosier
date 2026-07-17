begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(27);

select ok(c.relrowsecurity, format('%s has RLS enabled', c.relname))
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'home_page_settings',
    'shop_page_settings',
    'offering_public_hero_settings',
    'blog_page_settings',
    'studio_page_settings'
  )
order by c.relname;

select is(
  (select count(*)::integer from pg_policies
   where schemaname = 'public'
     and tablename in ('home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings')
     and cmd in ('ALL','INSERT','UPDATE','DELETE')
     and (coalesce(qual, '') in ('true','(true)') or coalesce(with_check, '') in ('true','(true)'))),
  0,
  'No permissive write policies remain'
);

select ok(has_table_privilege('anon', format('public.%I', table_name), 'SELECT'), table_name || ': anon can SELECT')
from unnest(array['home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings']) table_name;

select ok(has_table_privilege('authenticated', format('public.%I', table_name), 'SELECT'), table_name || ': authenticated can SELECT')
from unnest(array['home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings']) table_name;

select ok(not has_table_privilege('anon', format('public.%I', table_name), 'INSERT,UPDATE,DELETE'), table_name || ': anon cannot write')
from unnest(array['home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings']) table_name;

select ok(not has_table_privilege('authenticated', format('public.%I', table_name), 'INSERT,UPDATE,DELETE'), table_name || ': authenticated cannot write directly')
from unnest(array['home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings']) table_name;

select is(
  (select count(*)::integer from pg_policies
   where schemaname = 'public'
     and tablename in ('home_page_settings','shop_page_settings','offering_public_hero_settings','blog_page_settings','studio_page_settings')
     and cmd = 'SELECT'
     and roles @> array['anon']::name[]),
  5,
  'All five tables have an anon SELECT policy'
);

select * from finish();
rollback;
