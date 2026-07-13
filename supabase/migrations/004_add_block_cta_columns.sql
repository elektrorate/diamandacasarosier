-- Migration 004: Add cta_text and cta_url columns to landing_page_blocks
-- to match the LandingPageBlock TS interface.
alter table if exists public.landing_page_blocks
  add column if not exists cta_text text,
  add column if not exists cta_url text;
