-- Run after migration 035. No data changes survive this test.
begin;

set local role anon;
do $audit$
declare
  table_name text;
begin
  foreach table_name in array array[
    'home_page_settings',
    'shop_page_settings',
    'offering_public_hero_settings',
    'blog_page_settings',
    'studio_page_settings'
  ] loop
    execute format('select count(*) from public.%I', table_name);
    begin
      execute format(
        'update public.%I set updated_at = updated_at where false',
        table_name
      );
      raise exception 'anon write unexpectedly allowed on %', table_name;
    exception
      when insufficient_privilege then null;
    end;
  end loop;
end
$audit$;

reset role;
set local role authenticated;
do $audit$
declare
  table_name text;
begin
  foreach table_name in array array[
    'home_page_settings',
    'shop_page_settings',
    'offering_public_hero_settings',
    'blog_page_settings',
    'studio_page_settings'
  ] loop
    execute format('select count(*) from public.%I', table_name);
    begin
      execute format(
        'update public.%I set updated_at = updated_at where false',
        table_name
      );
      raise exception 'authenticated write unexpectedly allowed on %', table_name;
    exception
      when insufficient_privilege then null;
    end;
  end loop;
end
$audit$;

reset role;
set local role service_role;
do $audit$
declare
  table_name text;
begin
  foreach table_name in array array[
    'home_page_settings',
    'shop_page_settings',
    'offering_public_hero_settings',
    'blog_page_settings',
    'studio_page_settings'
  ] loop
    execute format('select count(*) from public.%I', table_name);
    execute format(
      'update public.%I set updated_at = updated_at where false',
      table_name
    );
  end loop;
end
$audit$;

reset role;
rollback;
