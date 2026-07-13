-- Migration 027: default rows for CMS-editable public pages.
-- Keeps production pages backed by Supabase immediately after the schema exists.

insert into public.studio_page_settings (
  id,
  status,
  hero,
  intro_content,
  show_idea_prompt_section,
  seo_title,
  seo_description,
  seo_image,
  updated_at
) values (
  'studio-page',
  'published',
  '{
    "heroVariant": "text",
    "heroTitle": "El Estudio",
    "heroSubtitle": "Casa Rosier",
    "heroPresentationText": "# El Estudio\n\nUn espacio para aprender ceramica con calma, explorar tecnicas y tocar la materia.",
    "heroPresentationTextColor": "#FFFFFF",
    "heroPresentationImage": "",
    "heroMenuTone": "dark",
    "heroMenuColor": "#000000",
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
  }'::jsonb,
  'Somos lo que somos y aqui estamos.

En Barcelona, un espacio para aprender ceramica con calma, explorar tecnicas, tocar la materia y encontrar una practica guiada que acompana cada primer gesto.',
  true,
  'El Estudio | Casa Rosier',
  'Conoce el estudio, sus especialistas y la forma de trabajar la ceramica en Casa Rosier.',
  '',
  now()
) on conflict (id) do nothing;

insert into public.blog_page_settings (
  id,
  status,
  hero,
  show_idea_prompt_section,
  seo_title,
  seo_description,
  seo_image,
  updated_at
) values (
  'blog-page',
  'published',
  '{
    "heroVariant": "text",
    "heroTitle": "Bitacora ceramica",
    "heroSubtitle": "Casa Rosier",
    "heroPresentationText": "# Bitacora ceramica\n\nProcesos, tecnicas y reflexiones alrededor de la ceramica contemporanea.",
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
  }'::jsonb,
  true,
  'Blog | Casa Rosier Ceramica',
  'Articulos, procesos y reflexiones sobre ceramica, talleres, tecnicas y creacion en Casa Rosier Ceramica Barcelona.',
  '',
  now()
) on conflict (id) do nothing;
