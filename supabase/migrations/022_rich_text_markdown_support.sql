-- Migration 022: rich text Markdown support
-- Ensures CMS long-form fields can store Markdown, image syntax and iframe HTML snippets.

alter table if exists public.offerings
  alter column excerpt type text,
  alter column description type text;

alter table if exists public.blog_posts
  alter column excerpt type text,
  alter column content type text,
  alter column featured_excerpt type text;

alter table if exists public.blog_post_blocks
  alter column title type text,
  alter column text type text,
  alter column custom_html type text;

alter table if exists public.teachers
  alter column bio type text;

alter table if exists public.promo_banners
  alter column text type text,
  alter column detail_text type text;

do $$
begin
  if to_regclass('public.offerings') is not null then
    comment on column public.offerings.description is 'Markdown body saved from the CMS visual editor.';
  end if;
  if to_regclass('public.blog_post_blocks') is not null then
    comment on column public.blog_post_blocks.text is 'Markdown block text saved from the CMS visual editor.';
  end if;
  if to_regclass('public.teachers') is not null then
    comment on column public.teachers.bio is 'Markdown bio saved from the CMS visual editor.';
  end if;
end $$;
