-- Fix trash_items.deleted_by: change from uuid FK to text
-- because the project uses local auth, not Supabase Auth
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join unnest(con.conkey) key(attnum) on true
    join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
    where nsp.nspname = 'public'
      and rel.relname = 'trash_items'
      and con.contype = 'f'
      and att.attname = 'deleted_by'
  loop
    execute format('alter table public.trash_items drop constraint if exists %I', constraint_name);
  end loop;
end $$;

alter table if exists public.trash_items
  alter column deleted_by type text using deleted_by::text;
