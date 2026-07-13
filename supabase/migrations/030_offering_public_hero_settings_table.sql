-- Migration 030: Public offering hero settings table
-- Mirrors the public hero/menu controls into explicit columns so published
-- slug pages can be tested and queried without digging through JSON.

create table if not exists public.offering_public_hero_settings (
  offering_id uuid primary key references public.offerings(id) on delete cascade,
  hero_variant text not null default 'text' check (hero_variant in ('image', 'text', 'presentation')),
  hero_menu_tone text not null default 'dark' check (hero_menu_tone in ('light', 'dark')),
  hero_menu_color text not null default '#3f3933',
  hero_menu_scale numeric(4,2) not null default 1 check (hero_menu_scale >= 0.5 and hero_menu_scale <= 2),
  hero_logo_position_x text not null default '50%',
  hero_logo_position_y text not null default '46px',
  hero_logo_width text not null default '118px',
  hero_logo_tablet_position_x text not null default '50%',
  hero_logo_tablet_position_y text not null default '42px',
  hero_logo_tablet_width text not null default '106px',
  hero_logo_mobile_position_x text not null default '50%',
  hero_logo_mobile_position_y text not null default '34px',
  hero_logo_mobile_width text not null default '92px',
  hero_menu_position_y text not null default '132px',
  hero_menu_tablet_position_y text not null default '118px',
  hero_menu_mobile_position_y text not null default '96px',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_offering_public_hero_settings_variant
  on public.offering_public_hero_settings (hero_variant);

insert into public.offering_public_hero_settings (
  offering_id,
  hero_variant,
  hero_menu_tone,
  hero_menu_color,
  hero_menu_scale,
  hero_logo_position_x,
  hero_logo_position_y,
  hero_logo_width,
  hero_logo_tablet_position_x,
  hero_logo_tablet_position_y,
  hero_logo_tablet_width,
  hero_logo_mobile_position_x,
  hero_logo_mobile_position_y,
  hero_logo_mobile_width,
  hero_menu_position_y,
  hero_menu_tablet_position_y,
  hero_menu_mobile_position_y,
  updated_at
)
select
  id,
  case
    when coalesce(details #>> '{class,heroVariant}', 'text') in ('image', 'text', 'presentation')
      then coalesce(details #>> '{class,heroVariant}', 'text')
    else 'text'
  end,
  case
    when coalesce(details #>> '{class,heroMenuTone}', 'dark') in ('light', 'dark')
      then coalesce(details #>> '{class,heroMenuTone}', 'dark')
    else 'dark'
  end,
  coalesce(nullif(details #>> '{class,heroMenuColor}', ''), '#3f3933'),
  case
    when coalesce(details #>> '{class,heroMenuScale}', '') ~ '^[0-9]+(\.[0-9]+)?$'
      then (details #>> '{class,heroMenuScale}')::numeric
    else 1
  end,
  coalesce(nullif(details #>> '{class,heroLogoPositionX}', ''), '50%'),
  coalesce(nullif(details #>> '{class,heroLogoPositionY}', ''), '46px'),
  coalesce(nullif(details #>> '{class,heroLogoWidth}', ''), '118px'),
  coalesce(nullif(details #>> '{class,heroLogoTabletPositionX}', ''), nullif(details #>> '{class,heroLogoPositionX}', ''), '50%'),
  coalesce(nullif(details #>> '{class,heroLogoTabletPositionY}', ''), nullif(details #>> '{class,heroLogoPositionY}', ''), '42px'),
  coalesce(nullif(details #>> '{class,heroLogoTabletWidth}', ''), nullif(details #>> '{class,heroLogoWidth}', ''), '106px'),
  coalesce(nullif(details #>> '{class,heroLogoMobilePositionX}', ''), nullif(details #>> '{class,heroLogoPositionX}', ''), '50%'),
  coalesce(nullif(details #>> '{class,heroLogoMobilePositionY}', ''), '34px'),
  coalesce(nullif(details #>> '{class,heroLogoMobileWidth}', ''), '92px'),
  coalesce(nullif(details #>> '{class,heroMenuPositionY}', ''), '132px'),
  coalesce(nullif(details #>> '{class,heroMenuTabletPositionY}', ''), nullif(details #>> '{class,heroMenuPositionY}', ''), '118px'),
  coalesce(nullif(details #>> '{class,heroMenuMobilePositionY}', ''), '96px'),
  now()
from public.offerings
where type in ('class', 'workshop', 'experience', 'gift_card')
on conflict (offering_id) do update set
  hero_variant = excluded.hero_variant,
  hero_menu_tone = excluded.hero_menu_tone,
  hero_menu_color = excluded.hero_menu_color,
  hero_menu_scale = excluded.hero_menu_scale,
  hero_logo_position_x = excluded.hero_logo_position_x,
  hero_logo_position_y = excluded.hero_logo_position_y,
  hero_logo_width = excluded.hero_logo_width,
  hero_logo_tablet_position_x = excluded.hero_logo_tablet_position_x,
  hero_logo_tablet_position_y = excluded.hero_logo_tablet_position_y,
  hero_logo_tablet_width = excluded.hero_logo_tablet_width,
  hero_logo_mobile_position_x = excluded.hero_logo_mobile_position_x,
  hero_logo_mobile_position_y = excluded.hero_logo_mobile_position_y,
  hero_logo_mobile_width = excluded.hero_logo_mobile_width,
  hero_menu_position_y = excluded.hero_menu_position_y,
  hero_menu_tablet_position_y = excluded.hero_menu_tablet_position_y,
  hero_menu_mobile_position_y = excluded.hero_menu_mobile_position_y,
  updated_at = now();

comment on table public.offering_public_hero_settings is
  'Public hero/menu controls for Clases, Workshops, Experiencias and Gift Cards slug pages.';
