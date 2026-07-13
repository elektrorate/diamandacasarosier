-- Restore the original Shop catalog lost during the CMS migration.
-- Prepared locally only; run `npm run supabase:push` when ready to apply.

insert into public.product_categories (
  id, name, slug, description, image_id, status, sort_order, created_at, updated_at, deleted_at
)
values
  ('827adedf-dc2f-5a9a-a8ac-5d7580e3685d', 'Jarrones', 'jarrones', 'Piezas contenedoras y formas verticales de ceramica.', 'img/clase-2.png', 'active', 1, '2026-01-01T00:00:00.000Z', now(), null),
  ('e915f3e6-8958-572f-8fae-ce964a58173d', 'Tazas', 'tazas', 'Piezas utilitarias de serie pequena.', 'img/social-3.jpg', 'active', 2, '2026-01-01T00:00:00.000Z', now(), null),
  ('5b07881b-050b-5308-9baa-9b132ece3734', 'Platos', 'platos', 'Superficies funcionales y piezas de mesa.', 'img/intro-b.jpg', 'active', 3, '2026-01-01T00:00:00.000Z', now(), null),
  ('fbfee97d-8c43-5364-a1ab-cd6ce67730b9', 'Cuencos', 'cuencos', 'Volumenes bajos, cuencos y piezas de uso cotidiano.', 'img/clase-1.png', 'active', 4, '2026-01-01T00:00:00.000Z', now(), null),
  ('ecd1a750-33f9-5475-9f9f-6013409a6fba', 'Esculturas', 'esculturas', 'Piezas de lectura organica y expresiva.', 'img/gift-1.jpg', 'active', 5, '2026-01-01T00:00:00.000Z', now(), null),
  ('7152461d-03b9-521b-936a-9aca36ebe0f0', 'Piezas unicas', 'piezas-unicas', 'Objetos de serie unica y trabajos minerales.', 'img/workshop-1.jpg', 'active', 6, '2026-01-01T00:00:00.000Z', now(), null)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_id = excluded.image_id,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now(),
  deleted_at = null;

insert into public.products (
  id, name, slug, sku, description, excerpt, main_image_id, gallery, price,
  compare_at_price, stock, low_stock_threshold, category_id, characteristics,
  weight, dimensions, seo_title, seo_description, seo_image, status,
  created_at, updated_at, deleted_at
)
values
  (
    'b59d4c41-dc76-53b7-869a-c3b25d1b7016',
    'Jarron de gres blanco',
    'jarron-de-gres-blanco',
    'SHOP-01',
    'Un jarron de presencia silenciosa, construido a mano y acabado con un esmalte blanco satinado que suaviza la lectura de la superficie.',
    'Pieza disponible para entrega inmediata.',
    'img/clase-2.png',
    array['img/clase-2.png','img/intro-e.jpg','img/social-4.jpeg'],
    85,
    null,
    1,
    1,
    '827adedf-dc2f-5a9a-a8ac-5d7580e3685d',
    'Material: Gres de alta temperatura
Tecnica: Modelado manual
Acabado: Esmalte blanco satinado
Ano: 2026',
    '',
    '18 x 12 cm',
    'Jarron de gres blanco | Casa Rosier Shop',
    'Pieza ceramica disponible en Casa Rosier: jarron de gres blanco modelado a mano.',
    'img/clase-2.png',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  ),
  (
    'ff52036d-eaab-5fb0-ae39-824de14f7f7e',
    'Taza irregular azul',
    'taza-irregular-azul',
    'SHOP-02',
    'Taza de perfil irregular y gesto visible, pensada para el uso cotidiano sin perder una lectura artesanal y muy directa.',
    'Hay varias unidades disponibles dentro de una serie pequena.',
    'img/social-3.jpg',
    array['img/social-3.jpg','img/intro-d.jpg','img/workshop-3.jpg'],
    32,
    null,
    4,
    2,
    'e915f3e6-8958-572f-8fae-ce964a58173d',
    'Material: Gres
Tecnica: Torno y alteracion manual
Acabado: Esmalte azul brillante
Ano: 2026',
    '',
    '9 x 8 cm',
    'Taza irregular azul | Casa Rosier Shop',
    'Taza ceramica azul de serie pequena disponible en Casa Rosier Shop.',
    'img/social-3.jpg',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  ),
  (
    'd46a5c63-4c9f-5f3e-8eda-8c06c50657ba',
    'Plato de superficie calida',
    'plato-de-superficie-calida',
    'SHOP-03',
    'Plato de borde abierto y tono calido, pensado como pieza funcional con una superficie suave y ligeramente irregular.',
    'Disponible como pieza individual.',
    'img/intro-b.jpg',
    array['img/intro-b.jpg','img/intro-a.jpg','img/social-2.jpg'],
    42,
    null,
    1,
    1,
    '5b07881b-050b-5308-9baa-9b132ece3734',
    'Material: Gres claro
Tecnica: Placa y refinado manual
Acabado: Esmalte crema satinado
Ano: 2026',
    '',
    '24 x 24 cm',
    'Plato de superficie calida | Casa Rosier Shop',
    'Plato ceramico de superficie calida disponible en Casa Rosier Shop.',
    'img/intro-b.jpg',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  ),
  (
    '95044e54-ddee-514b-8955-7c362cc479f3',
    'Cuenco de esmalte mate',
    'cuenco-de-esmalte-mate',
    'SHOP-04',
    'Cuenco de volumen limpio y esmalte mate, con un acabado calmado que deja a la forma tomar protagonismo.',
    'Disponible en una serie muy corta.',
    'img/clase-1.png',
    array['img/clase-1.png','img/intro-c.jpg','img/social-1.jpg'],
    48,
    null,
    3,
    1,
    'fbfee97d-8c43-5364-a1ab-cd6ce67730b9',
    'Material: Gres oscuro
Tecnica: Torno
Acabado: Esmalte negro mate
Ano: 2026',
    '',
    '16 x 16 cm',
    'Cuenco de esmalte mate | Casa Rosier Shop',
    'Cuenco ceramico de esmalte mate disponible en Casa Rosier Shop.',
    'img/clase-1.png',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  ),
  (
    'f7472457-dd76-5c45-8d20-520a64ba8e91',
    'Pieza escultorica organica',
    'pieza-escultorica-organica',
    'SHOP-05',
    'Una pieza escultorica de lectura organica, construida desde el volumen y la tension entre hueco, curva y materia.',
    'Solo existe esta pieza.',
    'img/gift-1.jpg',
    array['img/gift-1.jpg','img/social-4.jpeg','img/intro-e.jpg'],
    120,
    null,
    1,
    1,
    'ecd1a750-33f9-5475-9f9f-6013409a6fba',
    'Material: Gres chamotado
Tecnica: Construccion manual
Acabado: Sin esmalte, superficie pulida
Ano: 2026',
    '',
    '28 x 18 cm',
    'Pieza escultorica organica | Casa Rosier Shop',
    'Escultura ceramica organica y pieza unica disponible en Casa Rosier Shop.',
    'img/gift-1.jpg',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  ),
  (
    'e699cf7c-2edb-5a14-a9c3-d2dd1af3c28d',
    'Serie mineral 01',
    'serie-mineral-01',
    'SHOP-06',
    'Una pieza unica de caracter mas contemplativo, con superficie mineral y un equilibrio entre estructura y gesto.',
    'Pieza unica disponible.',
    'img/workshop-1.jpg',
    array['img/workshop-1.jpg','img/social-5.jpg','img/intro-d.jpg'],
    140,
    null,
    1,
    1,
    '7152461d-03b9-521b-936a-9aca36ebe0f0',
    'Material: Gres y engobe
Tecnica: Modelado manual
Acabado: Superficie mineral mate
Ano: 2026',
    '',
    '31 x 14 cm',
    'Serie mineral 01 | Casa Rosier Shop',
    'Pieza unica ceramica de la serie mineral disponible en Casa Rosier Shop.',
    'img/workshop-1.jpg',
    'published',
    '2026-01-01T00:00:00.000Z',
    now(),
    null
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sku = excluded.sku,
  description = excluded.description,
  excerpt = excluded.excerpt,
  main_image_id = excluded.main_image_id,
  gallery = excluded.gallery,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock = excluded.stock,
  low_stock_threshold = excluded.low_stock_threshold,
  category_id = excluded.category_id,
  characteristics = excluded.characteristics,
  weight = excluded.weight,
  dimensions = excluded.dimensions,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  seo_image = excluded.seo_image,
  status = excluded.status,
  updated_at = now(),
  deleted_at = null;
