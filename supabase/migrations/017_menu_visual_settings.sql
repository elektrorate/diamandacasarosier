-- Dedicated visual settings for the public menu.
-- Prepared locally only; run `npm run supabase:push` when ready to apply.

create table if not exists public.menu_visual_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  header_logo_url text not null default 'https://ilkrcakrduibgsfqfzti.supabase.co/storage/v1/object/public/media/img/logo-header.png',
  scroll_menu_background_color text not null default '#8c7457',
  scroll_menu_text_color text not null default '#fff9f1',
  scroll_menu_icon_color text not null default '#fff9f1',
  scroll_menu_logo_tint_enabled boolean not null default false,
  scroll_menu_logo_tint_color text not null default '#fff9f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.site_settings
  add column if not exists header_logo_url text,
  add column if not exists scroll_menu_background_color text not null default '#8c7457',
  add column if not exists scroll_menu_text_color text not null default '#fff9f1',
  add column if not exists scroll_menu_icon_color text not null default '#fff9f1',
  add column if not exists scroll_menu_logo_tint_enabled boolean not null default false,
  add column if not exists scroll_menu_logo_tint_color text not null default '#fff9f1';

insert into public.menu_visual_settings (
  key,
  header_logo_url,
  scroll_menu_background_color,
  scroll_menu_text_color,
  scroll_menu_icon_color,
  scroll_menu_logo_tint_enabled,
  scroll_menu_logo_tint_color
)
select
  'default',
  coalesce(nullif(header_logo_url, ''), nullif(logo_url, ''), 'https://ilkrcakrduibgsfqfzti.supabase.co/storage/v1/object/public/media/img/logo-header.png'),
  coalesce(nullif(scroll_menu_background_color, ''), '#8c7457'),
  coalesce(nullif(scroll_menu_text_color, ''), '#fff9f1'),
  coalesce(nullif(scroll_menu_icon_color, ''), nullif(scroll_menu_text_color, ''), '#fff9f1'),
  coalesce(scroll_menu_logo_tint_enabled, false),
  coalesce(nullif(scroll_menu_logo_tint_color, ''), nullif(scroll_menu_icon_color, ''), '#fff9f1')
from public.site_settings
order by updated_at desc
limit 1
on conflict (key) do update
set
  header_logo_url = excluded.header_logo_url,
  scroll_menu_background_color = excluded.scroll_menu_background_color,
  scroll_menu_text_color = excluded.scroll_menu_text_color,
  scroll_menu_icon_color = excluded.scroll_menu_icon_color,
  scroll_menu_logo_tint_enabled = excluded.scroll_menu_logo_tint_enabled,
  scroll_menu_logo_tint_color = excluded.scroll_menu_logo_tint_color,
  updated_at = now();

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'set_updated_at_trigger'
  ) then
    perform public.set_updated_at_trigger('menu_visual_settings');
  end if;
end $$;

alter table public.menu_visual_settings enable row level security;

drop policy if exists "anon_select_menu_visual_settings" on public.menu_visual_settings;
create policy "anon_select_menu_visual_settings"
  on public.menu_visual_settings for select to anon using (true);
