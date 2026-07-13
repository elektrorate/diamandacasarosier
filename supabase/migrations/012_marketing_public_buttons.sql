-- 008 — marketing_settings public buttons

alter table public.marketing_settings
  add column if not exists whatsapp_button_url text,
  add column if not exists instagram_button_url text,
  add column if not exists public_button_links jsonb not null default '[]'::jsonb;

update public.marketing_settings
set
  whatsapp_button_url = coalesce(whatsapp_button_url, ''),
  instagram_button_url = coalesce(instagram_button_url, ''),
  public_button_links = coalesce(public_button_links, '[]'::jsonb)
where public_button_links is null
   or whatsapp_button_url is null
   or instagram_button_url is null;
