-- Paginated media catalog indexes. Storage remains the binary source;
-- public.media_assets becomes the authoritative CMS listing.

create extension if not exists pg_trgm with schema extensions;

create unique index if not exists uq_media_assets_file_name
  on public.media_assets (file_name);

create index if not exists idx_media_assets_active_created
  on public.media_assets (created_at desc, id desc)
  where status = 'active';

create index if not exists idx_media_assets_status_folder_created
  on public.media_assets (status, folder, created_at desc, id desc);

create index if not exists idx_media_assets_active_name
  on public.media_assets (original_name, id)
  where status = 'active';

create index if not exists idx_media_assets_original_name_trgm
  on public.media_assets using gin (original_name extensions.gin_trgm_ops);