-- Migration 007: Promo banner modal fields
-- Extiende promo_banners para administrar el modal de entrada del home.

alter table if exists public.promo_banners
  add column if not exists key_text text,
  add column if not exists detail_text text,
  add column if not exists image_url text,
  add column if not exists button_text text;

do $$
begin
  alter table public.promo_banners
    add constraint promo_banners_key_text_length check (char_length(coalesce(key_text, '')) <= 40);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.promo_banners
    add constraint promo_banners_title_length check (char_length(coalesce(title, '')) <= 60);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.promo_banners
    add constraint promo_banners_text_length check (char_length(coalesce(text, '')) <= 140);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.promo_banners
    add constraint promo_banners_detail_text_length check (char_length(coalesce(detail_text, '')) <= 130);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.promo_banners
    add constraint promo_banners_button_text_length check (char_length(coalesce(button_text, '')) <= 28);
exception
  when duplicate_object then null;
end $$;
