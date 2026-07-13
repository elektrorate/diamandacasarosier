-- Separa los CTA publicos de ofertas y actualiza las rutas oficiales.

alter table public.offerings
  add column if not exists details jsonb not null default '{}'::jsonb;

with normalized as (
  select
    id,
    case
      when regexp_replace(coalesce(nullif(details #>> '{class,whatsappNumber}', ''), nullif(details #>> '{class,content,contactWhatsapp}', ''), '34633788860'), '\D', '', 'g') <> ''
        then 'https://wa.me/' || regexp_replace(coalesce(nullif(details #>> '{class,whatsappNumber}', ''), nullif(details #>> '{class,content,contactWhatsapp}', ''), '34633788860'), '\D', '', 'g')
      else 'https://wa.me/34633788860'
    end as whatsapp_href
  from public.offerings
  where type in ('class', 'workshop', 'experience', 'gift_card')
)
update public.offerings as offerings
set details = jsonb_set(
      coalesce(offerings.details, '{}'::jsonb),
      '{class}',
      jsonb_build_object(
        'ctaHref', coalesce(nullif(offerings.details #>> '{class,ctaConsultHref}', ''), nullif(offerings.details #>> '{class,ctaHref}', ''), normalized.whatsapp_href),
        'ctaConsultHref', coalesce(nullif(offerings.details #>> '{class,ctaConsultHref}', ''), nullif(offerings.details #>> '{class,ctaHref}', ''), normalized.whatsapp_href),
        'ctaEnrollHref', coalesce(nullif(offerings.details #>> '{class,ctaEnrollHref}', ''), nullif(offerings.details #>> '{class,ctaHref}', ''), normalized.whatsapp_href)
      ) || coalesce(offerings.details -> 'class', '{}'::jsonb),
      true
    ),
    updated_at = now()
from normalized
where offerings.id = normalized.id
  and (
    offerings.details -> 'class' is null
    or not (offerings.details -> 'class' ? 'ctaConsultHref')
    or not (offerings.details -> 'class' ? 'ctaEnrollHref')
  );

update public.menu_items
set url = case
    when url = '/reservas-privadas' then '/experiencias'
    when url like '/reservas-privadas/%' then regexp_replace(url, '^/reservas-privadas', '/experiencias')
    when url = '/gift-card' then '/gift-cards'
    when url like '/gift-card/%' then regexp_replace(url, '^/gift-card', '/gift-cards')
    else url
  end,
  updated_at = now()
where url = '/reservas-privadas'
   or url like '/reservas-privadas/%'
   or url = '/gift-card'
   or url like '/gift-card/%';

update public.menu_items
set label = 'Experiencias',
    updated_at = now()
where url = '/experiencias'
  and lower(label) in ('reservas privadas', 'experiencias');

update public.menu_items
set label = 'Gift Cards',
    updated_at = now()
where url = '/gift-cards'
  and lower(label) in ('tarjeta de regalo', 'tarjetas de regalo', 'targetas de regalo', 'giftcards', 'gift cards');

comment on column public.offerings.details is
  'JSON config. details.class incluye controles responsive de hero, ctaHref legado, ctaConsultHref, ctaEnrollHref, pricing, galleryImages, scheduleDays y content.';
