alter table public.blog_posts
  add column if not exists listing_excerpt text not null default '';

comment on column public.blog_posts.listing_excerpt is
  'Extracto editable y limpio utilizado en el listado administrativo de Bitácora.';