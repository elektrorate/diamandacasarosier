-- Site menu settings and default public menu.
-- Prepared locally only; run `npm run supabase:push` when ready to apply.

alter table if exists public.site_settings
  add column if not exists header_logo_url text,
  add column if not exists scroll_menu_background_color text not null default '#8c7457',
  add column if not exists scroll_menu_text_color text not null default '#fff9f1';

update public.site_settings
set
  header_logo_url = coalesce(
    nullif(header_logo_url, ''),
    nullif(logo_url, ''),
    'https://ilkrcakrduibgsfqfzti.supabase.co/storage/v1/object/public/media/img/logo-header.png'
  ),
  scroll_menu_background_color = coalesce(nullif(scroll_menu_background_color, ''), '#8c7457'),
  scroll_menu_text_color = coalesce(nullif(scroll_menu_text_color, ''), '#fff9f1')
where true;

insert into public.menus (id, name, location, status)
select '11111111-1111-4111-8111-111111111111', 'Menú principal', 'main', 'active'
where not exists (
  select 1 from public.menus where location = 'main' and status = 'active' and deleted_at is null
)
on conflict (name) do nothing;

do $$
declare
  main_menu_id uuid;
  item record;
begin
  select id into main_menu_id
  from public.menus
  where location = 'main' and status = 'active' and deleted_at is null
  order by updated_at desc
  limit 1;

  if main_menu_id is null then
    return;
  end if;

  for item in
    select *
    from (values
      ('Inicio', '/#hero', 0),
      ('Clases', '/clases', 1),
      ('Workshops', '/workshops', 2),
      ('Experiencias', '/reservas-privadas', 3),
      ('Gift Cards', '/gift-card', 4),
      ('El Estudio', '/el-estudio', 5),
      ('Shop', '/shop', 6)
    ) as defaults(label, url, sort_order)
  loop
    if not exists (
      select 1
      from public.menu_items
      where menu_id = main_menu_id
        and parent_id is null
        and url = item.url
    ) then
      insert into public.menu_items (
        menu_id,
        label,
        type,
        url,
        linked_entity_type,
        linked_entity_id,
        parent_id,
        sort_order,
        is_visible,
        open_in_new_tab
      )
      values (
        main_menu_id,
        item.label,
        'internal',
        item.url,
        'none',
        '',
        null,
        item.sort_order,
        true,
        false
      );
    end if;
  end loop;

  update public.menu_items
  set label = 'Experiencias', updated_at = now()
  where menu_id = main_menu_id
    and parent_id is null
    and url = '/reservas-privadas'
    and lower(label) in ('reservas privadas', 'experiencias');

  update public.menu_items
  set label = 'Gift Cards', updated_at = now()
  where menu_id = main_menu_id
    and parent_id is null
    and url = '/gift-card'
    and lower(label) in ('tarjeta de regalo', 'tarjetas de regalo', 'targetas de regalo', 'gift cards', 'giftcards');

  update public.menu_items
  set label = 'Inicio',
      type = 'internal',
      url = '/#hero',
      linked_entity_type = 'none',
      linked_entity_id = '',
      parent_id = null,
      sort_order = 0,
      is_visible = true,
      open_in_new_tab = false,
      updated_at = now()
  where menu_id = main_menu_id
    and parent_id is null
    and url in ('/#hero', '/', '/home');
end $$;
