-- Migration 003: Add missing columns to social_gallery_items
-- to match the SocialGalleryItem TS interface.
alter table if exists public.social_gallery_items
  add column if not exists image_url text,
  add column if not exists description text,
  add column if not exists is_visible boolean not null default true;
