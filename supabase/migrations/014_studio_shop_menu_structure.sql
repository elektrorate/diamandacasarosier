-- Studio submenu and Shop root item for the public main menu.
-- Prepared locally only; run `npm run supabase:push` when ready to apply.

do $$
declare
  main_menu_id uuid;
  studio_item_id uuid;
  shop_item_id uuid;
  legacy_blog_id uuid;
  studio_child_id uuid;
  blog_child_id uuid;
begin
  select id into main_menu_id
  from public.menus
  where location = 'main' and status = 'active' and deleted_at is null
  order by updated_at desc
  limit 1;

  if main_menu_id is null then
    return;
  end if;

  select id into studio_item_id
  from public.menu_items
  where menu_id = main_menu_id
    and parent_id is null
    and url = '/el-estudio'
  order by sort_order
  limit 1;

  if studio_item_id is null then
    insert into public.menu_items (
      menu_id, label, type, url, linked_entity_type, linked_entity_id,
      parent_id, sort_order, is_visible, open_in_new_tab
    )
    values (
      main_menu_id, 'El Estudio', 'internal', '/el-estudio', 'none', '',
      null, 5, true, false
    )
    returning id into studio_item_id;
  else
    update public.menu_items
    set label = 'El Estudio',
        type = 'internal',
        url = '/el-estudio',
        linked_entity_type = 'none',
        linked_entity_id = '',
        parent_id = null,
        sort_order = 5,
        is_visible = true,
        open_in_new_tab = false,
        updated_at = now()
    where id = studio_item_id;
  end if;

  select id into shop_item_id
  from public.menu_items
  where menu_id = main_menu_id
    and parent_id is null
    and url = '/shop'
  order by sort_order
  limit 1;

  if shop_item_id is null then
    select id into legacy_blog_id
    from public.menu_items
    where menu_id = main_menu_id
      and parent_id is null
      and url = '/blog'
    order by sort_order
    limit 1;

    if legacy_blog_id is not null then
      update public.menu_items
      set label = 'Shop',
          type = 'internal',
          url = '/shop',
          linked_entity_type = 'none',
          linked_entity_id = '',
          parent_id = null,
          sort_order = 6,
          is_visible = true,
          open_in_new_tab = false,
          updated_at = now()
      where id = legacy_blog_id
      returning id into shop_item_id;
    else
      insert into public.menu_items (
        menu_id, label, type, url, linked_entity_type, linked_entity_id,
        parent_id, sort_order, is_visible, open_in_new_tab
      )
      values (
        main_menu_id, 'Shop', 'internal', '/shop', 'none', '',
        null, 6, true, false
      )
      returning id into shop_item_id;
    end if;
  else
    update public.menu_items
    set label = 'Shop',
        sort_order = 6,
        is_visible = true,
        updated_at = now()
    where id = shop_item_id;
  end if;

  select id into studio_child_id
  from public.menu_items
  where menu_id = main_menu_id
    and parent_id = studio_item_id
    and url = '/el-estudio'
  order by sort_order
  limit 1;

  if studio_child_id is null then
    insert into public.menu_items (
      menu_id, label, type, url, linked_entity_type, linked_entity_id,
      parent_id, sort_order, is_visible, open_in_new_tab
    )
    values (
      main_menu_id, 'El Estudio', 'internal', '/el-estudio', 'none', '',
      studio_item_id, 0, true, false
    );
  else
    update public.menu_items
    set label = 'El Estudio',
        sort_order = 0,
        is_visible = true,
        updated_at = now()
    where id = studio_child_id;
  end if;

  select id into blog_child_id
  from public.menu_items
  where menu_id = main_menu_id
    and parent_id = studio_item_id
    and url = '/blog'
  order by sort_order
  limit 1;

  if blog_child_id is null then
    select id into legacy_blog_id
    from public.menu_items
    where menu_id = main_menu_id
      and parent_id is null
      and url = '/blog'
    order by sort_order
    limit 1;

    if legacy_blog_id is not null then
      update public.menu_items
      set label = 'Bitácora',
          type = 'internal',
          url = '/blog',
          linked_entity_type = 'none',
          linked_entity_id = '',
          parent_id = studio_item_id,
          sort_order = 1,
          is_visible = true,
          open_in_new_tab = false,
          updated_at = now()
      where id = legacy_blog_id
      returning id into blog_child_id;
    else
      insert into public.menu_items (
        menu_id, label, type, url, linked_entity_type, linked_entity_id,
        parent_id, sort_order, is_visible, open_in_new_tab
      )
      values (
        main_menu_id, 'Bitácora', 'internal', '/blog', 'none', '',
        studio_item_id, 1, true, false
      )
      returning id into blog_child_id;
    end if;
  else
    update public.menu_items
    set label = 'Bitácora',
        sort_order = 1,
        is_visible = true,
        updated_at = now()
    where id = blog_child_id;
  end if;

  update public.menu_items
  set is_visible = false,
      updated_at = now()
  where menu_id = main_menu_id
    and parent_id is null
    and url = '/blog'
    and id <> coalesce(blog_child_id, '00000000-0000-0000-0000-000000000000'::uuid);
end $$;
