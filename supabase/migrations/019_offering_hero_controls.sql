-- Migration 019: Offering hero controls
-- Amplia la configuracion JSON de offerings.details.class para soportar
-- posicion/tamano del logo, umbral del menu secundario y URL de CTA.

alter table if exists public.offerings
  add column if not exists details jsonb not null default '{}'::jsonb;

update public.offerings
set details = jsonb_set(
  coalesce(details, '{}'::jsonb),
  '{class}',
  jsonb_build_object(
    'heroLogoPositionX', '50%',
    'heroLogoPositionY', '46px',
    'heroLogoWidth', '118px',
    'heroLogoMobileWidth', '92px',
    'heroMenuPositionY', '132px',
    'ctaHref', ''
  ) || coalesce(details -> 'class', '{}'::jsonb),
  true
)
where type in ('class', 'workshop', 'experience', 'gift_card')
  and (
    details -> 'class' is null
    or not (details -> 'class' ? 'heroLogoPositionX')
    or not (details -> 'class' ? 'heroLogoPositionY')
    or not (details -> 'class' ? 'heroLogoWidth')
    or not (details -> 'class' ? 'heroLogoMobileWidth')
    or not (details -> 'class' ? 'heroMenuPositionY')
    or not (details -> 'class' ? 'ctaHref')
  );

comment on column public.offerings.details is
  'JSON config. details.class incluye heroVariant, heroMenuTone, heroLogoPositionX/Y, heroLogoWidth, heroLogoMobileWidth, heroMenuPositionY, ctaHref, pricing, galleryImages, scheduleDays y content.';
