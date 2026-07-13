# Casa Rosier Ceramica

Sitio web publico y CMS privado para Casa Rosier Ceramica. El proyecto permite
mostrar la experiencia comercial de la marca y administrar contenido, tienda,
marketing, multimedia, formularios, reservas, menus y configuracion general
desde un panel privado.

Deploy publico: [https://casa-rosier-ceramica.vercel.app](https://casa-rosier-ceramica.vercel.app)

Version del proyecto: `V1.113.53`

## Vision general

El sistema esta dividido en dos superficies principales:

- Sitio publico: home, clases, workshops, experiencias, gift cards, reservas
  privadas, bitacora, tienda, carrito, estudio y paginas legales.
- CMS privado: panel administrativo bajo `/admin/*` para gestionar contenido,
  catalogo, formularios, mensajes, marketing, usuarios, ajustes, historial y
  papelera.

El acceso administrativo inicia en `/auth`. La ruta `/admin` redirige a
`/admin/dashboard` y `/admin/login` redirige a `/auth`.

## Stack tecnico

- Next.js 16 con App Router.
- React 19 y React DOM 19.
- TypeScript 6 en modo estricto.
- Tailwind CSS 4.
- PostCSS con `@tailwindcss/postcss`.
- Supabase Auth para autenticacion.
- Supabase PostgreSQL para base de datos.
- Supabase Storage para archivos y multimedia.
- `@supabase/ssr` para sesiones en entorno server.
- `@supabase/supabase-js` para acceso cliente/servidor.
- Persistencia local en archivos JSON como fallback de desarrollo.
- Next Middleware para redirecciones administrativas.
- ESLint 9 con `eslint-config-next`.
- Sharp para procesamiento/optimizacion de imagenes.
- Playwright Core para verificaciones automatizadas cuando se requiere.
- Node.js y scripts `.mjs` para tareas de datos.
- CSS legacy conservado para respetar el diseno publico original.
- Fuentes locales Cormorant Garamond y Nunito.
- Material Symbols en el CMS.
- Deploy compatible con Vercel.

## Instalacion

Requisitos recomendados:

- Node.js compatible con Next.js 16.
- npm.
- Proyecto Supabase configurado si se desea usar base de datos remota.

Instalar dependencias:

```bash
npm install
```

Crear variables locales desde el ejemplo:

```bash
cp .env.example .env
```

Levantar entorno de desarrollo:

```bash
npm run dev
```

Servidor local por defecto:

```text
http://localhost:3000
```

## Variables de entorno

El archivo `.env.example` define:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

LOCAL_ADMIN_EMAIL=name@admin.com
LOCAL_ADMIN_PASSWORD_HASH=sha256-hash-generated-from-your-temporary-bootstrap-password
LOCAL_AUTH_SECRET=replace-with-a-long-random-secret
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` conectan el
  frontend con Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` permite operaciones privilegiadas del CMS desde
  servidor. No debe exponerse en cliente ni subirse al repositorio.
- `LOCAL_ADMIN_EMAIL`, `LOCAL_ADMIN_PASSWORD_HASH` y `LOCAL_AUTH_SECRET`
  habilitan el login local de arranque.
- El codigo tambien soporta `LOCAL_ADMIN_PASSWORD` como alternativa temporal,
  pero para produccion se recomienda usar hash.

## Scripts disponibles

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run lint
npm run typecheck
npm run supabase:push
npm run supabase:seed
```

Descripcion:

- `npm run dev`: inicia Next.js con webpack.
- `npm run dev:turbo`: inicia Next.js con configuracion por defecto.
- `npm run build`: genera build de produccion.
- `npm run start`: sirve build de produccion.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: ejecuta TypeScript sin emitir archivos.
- `npm run supabase:push`: aplica migraciones al proyecto Supabase enlazado.
- `npm run supabase:seed`: ejecuta seed de datos hacia Supabase.

## Arquitectura del proyecto

```text
src/
  app/
    admin/                  Rutas privadas del CMS.
    api/admin/              Endpoints privados del CMS.
    api/auth/               Login/logout administrativo.
    api/forms/              Recepcion publica de formularios.
    api/marketing/          Tracking de eventos publicos.
    auth/                   Pantalla de autenticacion.
    blog/                   Bitacora publica.
    carrito/                Carrito publico.
    clases/                 Paginas publicas de clases.
    el-estudio/             Pagina publica del estudio.
    experiencias/           Paginas publicas de experiencias.
    gift-card(s)/           Paginas publicas de gift cards.
    home/                   Home publica.
    shop/                   Tienda publica.
    workshops/              Paginas publicas de workshops.
  components/
    admin/                  Componentes del panel administrativo.
    collections/            Grids, cards y detalle de colecciones.
    hero/                   Componentes de hero publico.
    layout/                 Layout publico y administrativo.
    marketing/              Tracking y enlaces medibles.
    shop/                   Tienda y carrito.
    studio/                 Galeria del estudio.
    ui/                     UI compartida.
  data/                     Datos estaticos usados por la app.
  lib/
    admin/                  Navegacion y usuarios admin.
    auth/                   Autenticacion local y Supabase.
    cms/                    Capa de datos del CMS.
    marketing/              Tracking de eventos.
    supabase/               Clientes y tipos Supabase.
data/                       Fallback JSON editable por el CMS.
public/                     Imagenes, iconos y fuentes.
scripts/                    Seeds, auditorias y utilidades.
supabase/migrations/        Migraciones SQL.
```

## Sitio publico

Rutas principales:

- `/` y `/home`: pagina principal.
- `/clases` y `/clases/[slug]`: clases publicas.
- `/workshops` y `/workshops/[slug]`: workshops.
- `/experiencias` y `/experiencias/[slug]`: experiencias.
- `/gift-card`, `/gift-card/[slug]`, `/gift-cards`, `/gift-cards/[slug]`.
- `/reservas-privadas` y `/reservas-privadas/[slug]`.
- `/blog` y `/blog/[slug]`: bitacora.
- `/shop` y `/shop/[slug]`: tienda.
- `/carrito`: carrito de compra.
- `/el-estudio`: pagina editorial del estudio.
- `/politica-privacidad`: pagina legal.

El contenido publico se alimenta desde Supabase cuando esta configurado. Si no
hay conexion disponible, la aplicacion puede leer datos desde `data/*.json`.

## CMS privado

Rutas principales del panel:

- `/admin/dashboard`: resumen general.
- `/admin/home`: editor del home.
- `/admin/clases`, `/admin/workshops`, `/admin/experiencias`,
  `/admin/gift-cards`: gestion de ofertas y paginas comerciales.
- `/admin/estudio` y `/admin/el-estudio`: contenido del estudio.
- `/admin/bitacora`: posts y configuracion de bitacora.
- `/admin/shop`: modulo de tienda.
- `/admin/shop/products`: productos.
- `/admin/shop/categories`: categorias.
- `/admin/shop/orders`: pedidos.
- `/admin/shop/coupons`: cupones.
- `/admin/shop/shipping`: metodos de envio.
- `/admin/formularios`: formularios.
- `/admin/mensajes`: mensajes recibidos.
- `/admin/reservas`: reservas.
- `/admin/components/*`: headers, footers, banners, galerias sociales,
  testimonios, FAQs y especialistas.
- `/admin/menu`: estructura de navegacion publica.
- `/admin/media`: multimedia.
- `/admin/redirecciones`: redirecciones.
- `/admin/marketing/*`: analytics, Search Console, paginas, eventos,
  campanas UTM, conversiones, SEO, reportes y ajustes.
- `/admin/users`: usuarios.
- `/admin/settings`: ajustes generales.
- `/admin/legal-cookies`: privacidad y cookies.
- `/admin/history-logs`: historial de actividad.
- `/admin/trash`: papelera.

## Autenticacion y seguridad

`/admin/*` esta protegido desde el layout administrativo usando
`requireAdminProfile()`.

Flujos soportados:

- Login local firmado con cookie `casa_rosier_admin_session`.
- Validacion local por password plano temporal o hash SHA-256.
- Supabase Auth cuando las credenciales de Supabase estan configuradas.
- Autorizacion por perfiles con rol `admin` o `editor`.

La sesion local expira despues de 7 dias. `LOCAL_AUTH_SECRET` firma el token con
HMAC SHA-256.

## Datos y persistencia

La capa de datos vive principalmente en `src/lib/cms/*`.

Comportamiento esperado:

- Intenta leer/escribir en Supabase con cliente privilegiado.
- Si Supabase no esta disponible, usa archivos JSON en `data/`.
- Mantiene el CMS funcional durante desarrollo aunque no exista base remota.
- Centraliza entidades como productos, categorias, pedidos, cupones, menus,
  paginas, formularios, bitacora, estudio, marketing, legal, media y papelera.

## Supabase

Las migraciones SQL viven en `supabase/migrations/`. Incluyen tablas,
relaciones, valores iniciales, RLS, triggers y cambios incrementales para el CMS.

Aplicar migraciones al proyecto enlazado:

```powershell
$env:SUPABASE_ACCESS_TOKEN="tu_token_de_supabase"
$env:SUPABASE_TELEMETRY_DISABLED="1"
npx supabase db push --linked --yes
```

Revisar estado de migraciones:

```powershell
$env:SUPABASE_ACCESS_TOKEN="tu_token_de_supabase"
$env:SUPABASE_TELEMETRY_DISABLED="1"
npx supabase migration list --linked
```

Ejecutar seed:

```bash
npm run supabase:seed
```

No guardar tokens, service role keys ni secretos reales en el repositorio.

## Modulos del CMS

- Contenido editorial: paginas, landing pages, home, estudio y bitacora.
- Ofertas: clases, workshops, experiencias, gift cards y reservas privadas.
- Componentes reutilizables: headers, footers, banners, galerias sociales,
  testimonios, FAQs y especialistas.
- Tienda: productos, categorias, pedidos, cupones, metodos de envio y pagina de
  shop.
- Marketing: analytics, eventos, paginas, campanas, conversiones, SEO,
  Search Console, reportes y configuracion.
- Operacion: formularios, mensajes, reservas, usuarios, multimedia, menus,
  redirecciones, ajustes, privacidad, historial y papelera.

## Multimedia e imagenes

Los recursos publicos se encuentran en `public/`:

- `public/img/`: imagenes del sitio, logos, iconos y assets editoriales.
- `public/fonts/`: fuentes locales Cormorant Garamond y Nunito.

Next.js esta configurado con imagenes sin optimizacion remota en
`next.config.ts`:

```ts
images: {
  unoptimized: true
}
```

## Estilos y UI

- Tailwind CSS 4 para estilos modernos del proyecto.
- Archivos legacy en `src/app/legacy/*.css` para conservar fidelidad visual del
  sitio publico.
- Componentes UI propios en `src/components/ui`.
- Panel CMS con sidebar, metric cards, tablas, formularios, modales, badges,
  paginacion, switches, selects y estados de carga.

## Calidad y verificacion

Comandos recomendados antes de publicar:

```bash
npm run typecheck
npm run lint
npm run build
```

Validaciones funcionales sugeridas:

- `/auth` debe responder correctamente.
- `/admin/dashboard` sin sesion debe exigir autenticacion.
- Login valido debe crear cookie de sesion.
- Login incorrecto debe devolver error.
- Rutas publicas principales deben renderizar sin errores.
- CMS debe poder leer/escribir en Supabase o fallback JSON.

## Deploy

El proyecto es compatible con Vercel. Para produccion:

- Configurar variables de entorno en el proveedor de deploy.
- Usar credenciales reales de Supabase.
- Definir `LOCAL_AUTH_SECRET` con un valor largo y privado.
- Usar `LOCAL_ADMIN_PASSWORD_HASH` si se mantiene bootstrap local.
- Ejecutar migraciones antes de usar el CMS contra base remota.
- Verificar `npm run build` antes de publicar.

## Creador del proyecto

Creador del proyecto: Jose Manuel Castillo Queh (Desarrollador Full Stack:
NextJS, Supabase).

Tecnologias del proyecto: Next.js 16, App Router, React 19, React DOM 19,
TypeScript 6, Tailwind CSS 4, PostCSS, Supabase Auth, Supabase PostgreSQL,
Supabase Storage, `@supabase/ssr`, `@supabase/supabase-js`, Next Middleware,
Node.js, npm, ESLint 9, `eslint-config-next`, Sharp, Playwright Core, JSON
local fallback, SQL migrations, Vercel, CSS legacy, Material Symbols, Cormorant
Garamond y Nunito.
