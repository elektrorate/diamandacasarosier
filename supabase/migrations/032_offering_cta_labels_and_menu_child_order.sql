-- Adds persisted CTA labels in offerings.details.class and normalizes sibling menu ordering.

update public.offerings
set details = jsonb_set(
  coalesce(details, '{}'::jsonb),
  '{class}',
  coalesce(details -> 'class', '{}'::jsonb) || jsonb_build_object(
    'ctaConsultLabel',
    coalesce(
      nullif(details #>> '{class,ctaConsultLabel}', ''),
      case when type = 'gift_card' then 'Comprar' else 'Consultar' end
    ),
    'ctaEnrollLabel',
    coalesce(
      nullif(details #>> '{class,ctaEnrollLabel}', ''),
      case when type = 'gift_card' then 'Anadir al carrito' else 'Inscribirme' end
    )
  ),
  true
)
where type in ('class', 'workshop', 'experience', 'gift_card');

with ranked as (
  select
    id,
    row_number() over (
      partition by menu_id, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
      order by sort_order, created_at, id
    ) - 1 as next_sort_order
  from public.menu_items
)
update public.menu_items as item
set sort_order = ranked.next_sort_order
from ranked
where item.id = ranked.id
  and item.sort_order is distinct from ranked.next_sort_order;
