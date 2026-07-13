-- Migration 029: Public offering hero menu defaults
-- Ensures Clases, Workshops, Experiencias and Gift Cards always have the
-- hero/menu controls expected by the public slug pages.

alter table if exists public.offerings
  alter column details type jsonb using coalesce(details, '{}'::jsonb);

update public.offerings
set details = jsonb_set(
  coalesce(details, '{}'::jsonb),
  '{class}',
  jsonb_build_object(
    'heroVariant', coalesce(details #>> '{class,heroVariant}', details ->> 'heroVariant', 'text'),
    'heroMenuTone', coalesce(details #>> '{class,heroMenuTone}', details ->> 'heroMenuTone', 'dark'),
    'heroMenuColor', coalesce(details #>> '{class,heroMenuColor}', details ->> 'heroMenuColor', '#3f3933'),
    'heroMenuScale',
      case
        when coalesce(details #>> '{class,heroMenuScale}', details ->> 'heroMenuScale') ~ '^[0-9]+(\.[0-9]+)?$'
          then to_jsonb((coalesce(details #>> '{class,heroMenuScale}', details ->> 'heroMenuScale'))::numeric)
        else to_jsonb(1)
      end,
    'heroLogoPositionX', coalesce(details #>> '{class,heroLogoPositionX}', details ->> 'heroLogoPositionX', '50%'),
    'heroLogoPositionY', coalesce(details #>> '{class,heroLogoPositionY}', details ->> 'heroLogoPositionY', '46px'),
    'heroLogoWidth', coalesce(details #>> '{class,heroLogoWidth}', details ->> 'heroLogoWidth', '118px'),
    'heroLogoTabletPositionX', coalesce(details #>> '{class,heroLogoTabletPositionX}', details ->> 'heroLogoTabletPositionX', details #>> '{class,heroLogoPositionX}', details ->> 'heroLogoPositionX', '50%'),
    'heroLogoTabletPositionY', coalesce(details #>> '{class,heroLogoTabletPositionY}', details ->> 'heroLogoTabletPositionY', details #>> '{class,heroLogoPositionY}', details ->> 'heroLogoPositionY', '42px'),
    'heroLogoTabletWidth', coalesce(details #>> '{class,heroLogoTabletWidth}', details ->> 'heroLogoTabletWidth', details #>> '{class,heroLogoWidth}', details ->> 'heroLogoWidth', '106px'),
    'heroLogoMobilePositionX', coalesce(details #>> '{class,heroLogoMobilePositionX}', details ->> 'heroLogoMobilePositionX', details #>> '{class,heroLogoPositionX}', details ->> 'heroLogoPositionX', '50%'),
    'heroLogoMobilePositionY', coalesce(details #>> '{class,heroLogoMobilePositionY}', details ->> 'heroLogoMobilePositionY', '34px'),
    'heroLogoMobileWidth', coalesce(details #>> '{class,heroLogoMobileWidth}', details ->> 'heroLogoMobileWidth', '92px'),
    'heroMenuPositionY', coalesce(details #>> '{class,heroMenuPositionY}', details ->> 'heroMenuPositionY', '132px'),
    'heroMenuTabletPositionY', coalesce(details #>> '{class,heroMenuTabletPositionY}', details ->> 'heroMenuTabletPositionY', details #>> '{class,heroMenuPositionY}', details ->> 'heroMenuPositionY', '118px'),
    'heroMenuMobilePositionY', coalesce(details #>> '{class,heroMenuMobilePositionY}', details ->> 'heroMenuMobilePositionY', '96px')
  ) || coalesce(details -> 'class', '{}'::jsonb),
  true
)
where type in ('class', 'workshop', 'experience', 'gift_card');

comment on column public.offerings.details is
  'JSONB CMS details. details.class includes public hero/menu controls for slug pages: heroMenuColor, heroMenuScale, logo/menu responsive positions, CTA, pricing, galleryImages, scheduleDays and content.';
