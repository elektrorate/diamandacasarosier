-- Migration 018: Promo banner rich text limits
-- Permite guardar markdown breve en las descripciones del modal promocional.

alter table if exists public.promo_banners
  drop constraint if exists promo_banners_text_length,
  drop constraint if exists promo_banners_detail_text_length;

alter table if exists public.promo_banners
  add constraint promo_banners_text_length check (char_length(coalesce(text, '')) <= 600),
  add constraint promo_banners_detail_text_length check (char_length(coalesce(detail_text, '')) <= 600);
