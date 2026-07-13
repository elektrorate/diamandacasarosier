-- Migration 031: Add hero settings column to home_page_settings.
-- Stores the CMS hero configuration (variant, title, menu/logo positioning,
-- menu color) edited via the reusable SharedHeroEditor on the Home page.

alter table public.home_page_settings
  add column if not exists hero jsonb not null default '{}'::jsonb;

-- Seed the new column with sensible defaults mirroring defaultHeroSettings.
update public.home_page_settings
set hero = '{
    "heroVariant": "text",
    "heroTitle": "Casa Rosier",
    "heroSubtitle": "Ceramica con las manos",
    "heroPresentationText": "",
    "heroPresentationTextColor": "#FFFFFF",
    "heroPresentationImage": "",
    "heroMenuTone": "dark",
    "heroMenuColor": "#3f3933",
    "heroMenuScale": 1,
    "heroLogoPositionX": "50%",
    "heroLogoPositionY": "46px",
    "heroLogoWidth": "118px",
    "heroLogoTabletPositionX": "50%",
    "heroLogoTabletPositionY": "42px",
    "heroLogoTabletWidth": "106px",
    "heroLogoMobilePositionX": "50%",
    "heroLogoMobilePositionY": "34px",
    "heroLogoMobileWidth": "92px",
    "heroMenuPositionY": "132px",
    "heroMenuTabletPositionY": "118px",
    "heroMenuMobilePositionY": "96px",
    "heroImage": "/img/hero-bg.jpg",
    "titleImage": "",
    "titleImageSecondary": ""
  }'::jsonb
where hero = '{}'::jsonb;