alter table if exists public.blog_posts
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_order integer not null default 0,
  add column if not exists featured_excerpt text,
  add column if not exists visible_in_listing boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists idx_blog_posts_featured
  on public.blog_posts (is_featured, featured_order)
  where is_featured = true and status = 'published';

create index if not exists idx_blog_posts_listing_order
  on public.blog_posts (visible_in_listing, sort_order, published_at desc)
  where status = 'published';
