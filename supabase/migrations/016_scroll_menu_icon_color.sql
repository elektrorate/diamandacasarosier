-- Scroll menu icon color setting.
-- Prepared locally only; run `npm run supabase:push` when ready to apply.

alter table if exists public.site_settings
  add column if not exists scroll_menu_icon_color text not null default '#fff9f1';

update public.site_settings
set scroll_menu_icon_color = coalesce(
  nullif(scroll_menu_icon_color, ''),
  nullif(scroll_menu_text_color, ''),
  '#fff9f1'
)
where true;
