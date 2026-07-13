-- Migration 020: Responsive offering hero controls
-- Agrega defaults JSON para posicion/tamano del hero por dispositivo.

update public.offerings
set details = jsonb_set(
  coalesce(details, '{}'::jsonb),
  '{class}',
  jsonb_build_object(
    'heroLogoTabletPositionX', '50%',
    'heroLogoTabletPositionY', '42px',
    'heroLogoTabletWidth', '106px',
    'heroLogoMobilePositionX', '50%',
    'heroLogoMobilePositionY', '34px',
    'heroMenuTabletPositionY', '118px',
    'heroMenuMobilePositionY', '96px'
  ) || coalesce(details -> 'class', '{}'::jsonb),
  true
)
where type in ('class', 'workshop', 'experience', 'gift_card')
  and (
    details -> 'class' is null
    or not (details -> 'class' ? 'heroLogoTabletPositionX')
    or not (details -> 'class' ? 'heroLogoTabletPositionY')
    or not (details -> 'class' ? 'heroLogoTabletWidth')
    or not (details -> 'class' ? 'heroLogoMobilePositionX')
    or not (details -> 'class' ? 'heroLogoMobilePositionY')
    or not (details -> 'class' ? 'heroMenuTabletPositionY')
    or not (details -> 'class' ? 'heroMenuMobilePositionY')
  );

comment on column public.offerings.details is
  'JSON config. details.class incluye controles responsive de hero para desktop/tablet/mobile, CTA, pricing, galleryImages, scheduleDays y content.';
