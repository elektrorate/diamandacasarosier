-- Migration 028: CMS page settings for Home and Shop plus editable footer presentation fields.

create table if not exists public.home_page_settings (
  id text primary key,
  status text not null default 'published',
  intro_slides jsonb not null default '[]'::jsonb,
  classes_title text not null default 'Cursos y Talleres de Ceramica',
  classes_subtitle text not null default 'En Barcelona',
  classes_featured_ids jsonb not null default '[]'::jsonb,
  workshops_title text not null default 'Workshops de Especializacion',
  workshops_subtitle text not null default 'En Barcelona',
  workshops_featured_ids jsonb not null default '[]'::jsonb,
  gift_title text not null default 'Experiencia en Ceramica',
  gift_subtitle text not null default 'Regala una Gift Card',
  gift_featured_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_page_settings (
  id text primary key,
  status text not null default 'published',
  hero jsonb not null default '{}'::jsonb,
  show_characteristics_in_preview boolean not null default true,
  preview_characteristic_labels jsonb not null default '["Peso","Medidas","Caracteristicas"]'::jsonb,
  seo_title text not null default 'Shop | Casa Rosier',
  seo_description text not null default 'Piezas ceramicas disponibles en Casa Rosier.',
  seo_image text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.footers
  add column if not exists contact_title text not null default 'Contacto',
  add column if not exists contact_text text not null default '+34 600 000 000
Barcelona, Espana
Lunes a Sabado - 10:00 a 20:00
Siguenos en Nuestras Redes:',
  add column if not exists form_button_color text not null default '#111111',
  add column if not exists form_button_text_color text not null default '#ffffff',
  add column if not exists social_button_color text not null default '#2f2723',
  add column if not exists social_icon_color text not null default '#ffffff';

insert into public.home_page_settings (
  id,
  status,
  intro_slides,
  classes_title,
  classes_subtitle,
  workshops_title,
  workshops_subtitle,
  gift_title,
  gift_subtitle,
  updated_at
) values (
  'home-page',
  'published',
  '[
    {"id":"intro-1","text":"Un espacio para tocar la arcilla, aprender con calma y crear piezas con una mirada propia.","buttonText":"Reserva una experiencia","buttonHref":"/clases","image":"img/1766778567125-t8t5rt.png","imageAlt":"Composicion visual de piezas ceramicas y retrato en Casa Rosier","isVisible":true,"sortOrder":0},
    {"id":"intro-2","text":"Ceramica, materia y tiempo para crear con las manos en Barcelona.","buttonText":"Ver clases","buttonHref":"/clases","image":"img/intro-e.jpg","imageAlt":"Retrato editorial junto a piezas ceramicas claras","isVisible":true,"sortOrder":1},
    {"id":"intro-3","text":"Clases y workshops para explorar la ceramica desde la practica y el proceso.","buttonText":"Ver workshops","buttonHref":"/workshops","image":"img/workshop-3.jpg","imageAlt":"Piezas ceramicas esmaltadas en rojo y azul sobre pedestales","isVisible":true,"sortOrder":2},
    {"id":"intro-4","text":"Un taller para probar, equivocarse, volver a empezar y descubrir nuevas formas.","buttonText":"Conoce el estudio","buttonHref":"/el-estudio","image":"img/social-5.png","imageAlt":"Coleccion de cuencos y piezas ceramicas en tonos claros","isVisible":true,"sortOrder":3}
  ]'::jsonb,
  'Cursos y Talleres de Ceramica',
  'En Barcelona',
  'Workshops de Especializacion',
  'En Barcelona',
  'Experiencia en Ceramica',
  'Regala una Gift Card',
  now()
) on conflict (id) do nothing;

insert into public.shop_page_settings (
  id,
  status,
  hero,
  show_characteristics_in_preview,
  preview_characteristic_labels,
  seo_title,
  seo_description,
  seo_image,
  updated_at
) values (
  'shop-page',
  'published',
  '{
    "heroVariant": "text",
    "heroTitle": "Shop",
    "heroSubtitle": "Casa Rosier",
    "heroPresentationText": "# Shop\n\nPiezas ceramicas creadas con tiempo, materia y mirada propia.",
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
    "heroImage": "/img/social-2.jpg",
    "titleImage": "",
    "titleImageSecondary": ""
  }'::jsonb,
  true,
  '["Peso","Medidas","Caracteristicas"]'::jsonb,
  'Shop | Casa Rosier',
  'Piezas ceramicas disponibles en Casa Rosier.',
  '',
  now()
) on conflict (id) do nothing;
