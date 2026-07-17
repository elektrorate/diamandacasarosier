# Auditoría general del proyecto Casa Rosier

**Fecha:** 16 de julio de 2026  
**Repositorio local:** `D:\A web diamanda rosier\diamandacasarosier`  
**Entorno auditado:** `http://localhost:6001`

## Conclusión ejecutiva

El proyecto es navegable y mantiene un comportamiento responsive estable en las páginas comprobadas. No se encontraron errores 404 inesperados, imágenes visibles rotas ni desplazamiento horizontal en los tamaños auditados.

Sin embargo, el proyecto todavía no está completamente estable para producción. Los riesgos principales se concentran en el CMS: errores de hidratación relacionados con el formato de fechas, controles de formulario sin etiquetas accesibles y una conexión incompleta entre la nueva sección «Tarjeta para Home» y el carrusel público de Gift Cards.

Durante esta auditoría no se modificó contenido ni información de la base de datos.

## Alcance de la auditoría

### Tamaños comprobados

- Teléfono: 390 × 844 px.
- Tablet: 768 × 1024 px.
- Escritorio: 1440 × 900 px.

### Navegación pública

Se comprobaron 13 rutas públicas principales en los tres tamaños:

- Inicio.
- Clases.
- Workshops.
- Experiencias.
- Gift Cards.
- El estudio.
- Bitácora.
- Shop.
- Política de privacidad.
- Carrito.
- Reservas privadas.
- Alias `/home`.
- Alias `/gift-card`.

También se comprobaron siete páginas públicas de detalle en los tres tamaños:

- Dos clases.
- Un workshop.
- Una experiencia.
- Una Gift Card.
- Un artículo de Bitácora.
- Un producto del Shop.

### Navegación administrativa

- Se recorrieron las 43 entradas del menú lateral del CMS en escritorio.
- Se comprobaron 12 pantallas principales del CMS en teléfono y tablet.
- Se revisaron los editores de clases y Gift Cards.
- Se verificó el estado activo del menú lateral durante la edición.
- Se revisó el botón de cierre de sesión.

### Comprobaciones técnicas

- TypeScript.
- Compilación completa de producción.
- ESLint global.
- Errores de consola.
- Rutas 404.
- Redirecciones 301.
- Desbordamiento horizontal.
- Imágenes visibles rotas.
- Enlaces vacíos.
- Estructura y comportamiento del menú móvil.
- Etiquetado accesible de formularios.

## Resultados correctos

- La comprobación de TypeScript finaliza sin errores.
- La compilación de producción finaliza correctamente.
- Las páginas públicas auditadas no generan errores de consola.
- No se encontraron 404 inesperados.
- Las rutas inexistentes públicas y administrativas responden con 404.
- La redirección configurada `/home → /` responde correctamente con estado 301.
- No se encontró desplazamiento horizontal en teléfono, tablet o escritorio.
- No se encontraron imágenes visibles rotas en las páginas de detalle comprobadas.
- El menú móvil abre y cierra correctamente.
- El menú móvil se cierra mediante la tecla Escape.
- El apartado correspondiente del menú lateral permanece marcado al editar clases y Gift Cards.
- Existe un único botón visible «Cerrar sesión» por pantalla del CMS.
- El selector de contenidos destacados del Home continúa funcionando.

## Problemas prioritarios

### 1. Errores de hidratación en el CMS

React detecta diferencias entre el texto generado por el servidor y el generado por el navegador. El problema observado corresponde al formato de fechas: el servidor muestra una hora en formato de 24 horas y el navegador puede regenerarla con indicadores `a. m.` o `p. m.`.

Se confirmó el problema en:

- `src/components/admin/PagesTable.tsx`
- `src/components/admin/SettingsForm.tsx`
- `src/components/admin/HistoryLogsTable.tsx`
- `src/components/admin/TrashTable.tsx`
- `src/components/admin/FormsTable.tsx`

El mismo patrón de `toLocaleString()` o `toLocaleDateString()` aparece en otras tablas administrativas, por lo que pueden existir más pantallas afectadas cuando tengan registros visibles.

**Consecuencia:** React descarta parte del HTML inicial y vuelve a generar la tabla en el navegador. Esto puede producir parpadeos, pérdida temporal de estado y errores de consola.

**Corrección recomendada:** utilizar una función de formato compartida con idioma, zona horaria y opciones explícitas, o enviar desde el servidor una cadena ya normalizada que no cambie durante la hidratación.

### 2. «Tarjeta para Home» no está completamente conectada en Gift Cards

La pestaña «Tarjeta para Home» aparece en clases, workshops, experiencias y Gift Cards porque estos contenidos comparten `ClassEditForm`.

Para clases y workshops los campos están conectados con `FeaturedSection`. Sin embargo, el carrusel público de Gift Cards continúa utilizando:

- `coverImage`
- `title`
- `excerpt`

El carrusel no consume todavía:

- `homeImage`
- `homeImageAlt`
- `homeTitle`
- `homeEyebrow`
- `homeExcerpt`

Archivos relacionados:

- `src/components/admin/ClassEditForm.tsx`
- `src/components/home/GiftCarousel.tsx`
- `src/features/home/HomeGiftCardSection.tsx`

En Experiencias también aparece la pestaña, aunque actualmente no existe una sección de experiencias destacadas en el Home.

**Consecuencia:** el CMS permite editar campos que pueden no reflejarse en la portada pública.

**Corrección recomendada:** decidir una de estas dos opciones:

1. Conectar `GiftCarousel` con los campos específicos de Home y ocultar la pestaña únicamente en Experiencias.
2. Mostrar la pestaña solamente en clases y workshops.

### 3. Campos del Hero sin etiqueta accesible

En el editor de una clase se comprobaron 13 controles visibles del Hero y ninguno tenía una asociación programática completa entre el texto visual y el control.

El origen está principalmente en:

- `src/components/admin/SharedHeroEditor.tsx`
- `src/components/admin/ClassEditForm.tsx`

Los componentes muestran un elemento `label`, pero este no utiliza `htmlFor`, no envuelve el `input` y el control tampoco recibe `aria-label` o `aria-labelledby`.

**Consecuencia:** lectores de pantalla y otras tecnologías de asistencia pueden anunciar solamente el placeholder o no identificar correctamente la finalidad del campo.

**Corrección recomendada:** generar un identificador estable por campo y asociar `label htmlFor={id}` con `input id={id}`. Los sliders también deben recibir un nombre accesible.

## Problemas secundarios

### 4. La revisión global de ESLint no está limpia

Resultado actual:

- 2 errores.
- 58 advertencias.

Los dos errores están en:

- `scripts/check-shop.mjs`

El script utiliza importaciones mediante `require()`, prohibidas por la configuración actual de ESLint.

También existe una advertencia relevante en:

- `src/components/admin/ColorPickerField.tsx`

El efecto de arrastre no declara todas sus dependencias (`updateFromHue` y `updateFromSpectrum`).

**Corrección recomendada:** migrar el script a ESM o excluirlo de la revisión si es una utilidad antigua; estabilizar las funciones del selector de color con `useCallback` o reorganizar el efecto.

### 5. El menú móvil conserva dos estructuras en el DOM

La navegación móvil funciona y el elemento inactivo utiliza `aria-hidden` e `inert`, por lo que no se confirmó un fallo visible o de interacción durante la prueba.

No obstante, siguen existiendo:

- `mobile-static-nav`
- `mobile-scroll-nav`

Archivo principal:

- `src/components/layout/NavbarGlobal.tsx`

Esto no cumple completamente el objetivo anterior de mantener una sola estructura móvil.

**Corrección recomendada:** utilizar un único contenedor y cambiar únicamente su estado visual al hacer scroll. Si se mantienen las dos estructuras, debe documentarse como una decisión deliberada y conservar las garantías de `inert`, `aria-hidden` y gestión de foco.

### 6. Protección de enlaces externos no uniforme

Los enlaces configurados desde el menú público utilizan `noopener noreferrer`. Otros componentes utilizan solamente `noreferrer`.

No se confirmó una vulnerabilidad directa, ya que `noreferrer` también impide el acceso habitual a `window.opener` en navegadores actuales, pero el estándar del proyecto no es uniforme.

Componentes relacionados:

- `src/components/layout/PublicFooterContent.tsx`
- `src/components/layout/WhatsAppFloat.tsx`
- `src/components/ui/MarkdownContent.tsx`
- `src/components/collections/DetailPage.tsx`

**Corrección recomendada:** aplicar siempre `rel="noopener noreferrer"` a enlaces externos con `target="_blank"`.

## Contenido público pendiente de limpieza

Durante la navegación se encontraron textos que parecen provisionales o de prueba:

- `Clases2`
- `Talleres`, mientras otras secciones utilizan «Workshops».
- H1 del Home: `un texto por acá`.
- Otros títulos y descripciones de prueba dentro de tarjetas.

Estos valores son editables desde el CMS y no representan un fallo de conexión ni de código, pero deben corregirse antes de considerar el contenido listo para producción.

## Orden recomendado de corrección

1. Corregir la hidratación y centralizar el formato de fechas.
2. Definir y corregir el comportamiento de «Tarjeta para Home» en Gift Cards y Experiencias.
3. Asociar correctamente las etiquetas de todos los controles del Hero.
4. Corregir los errores de ESLint y revisar las advertencias de React.
5. Simplificar o documentar la estructura doble del menú móvil.
6. Unificar la protección de enlaces externos.
7. Limpiar los textos provisionales desde el CMS.
8. Repetir la auditoría responsive y la compilación completa.

## Criterios para cerrar la auditoría

- Cero errores de hidratación en consola.
- TypeScript y compilación de producción correctos.
- ESLint sin errores.
- Los campos de Home afectan exactamente a las secciones públicas correspondientes.
- Todos los campos de formulario tienen nombre accesible.
- No existen controles móviles duplicados accesibles.
- No hay 404 inesperados ni desplazamiento horizontal.
- Los textos públicos definitivos están publicados.


## Reauditoría final de producción

Comprobación realizada sobre `https://diamandacasarosier.vercel.app` después del despliegue de producción `dpl_FuhQBCP5D8pCe9Gdz7ZPdwt8RSEZ`.

- Compilación de producción y TypeScript completados correctamente en Vercel.
- ESLint finaliza con 0 errores y 57 advertencias no bloqueantes.
- Se revisaron las rutas públicas principales en móvil (390 px), tablet (768 px y 1024 px) y escritorio (1440 px).
- Se revisaron páginas de detalle de clases, workshops, experiencias, Gift Cards, Shop y Bitácora.
- No se detectaron errores ni advertencias de consola durante la navegación auditada.
- La ruta inexistente `/ruta-que-no-existe-auditoria` devuelve estado HTTP 404.
- No se detectó desplazamiento horizontal del documento en ninguna resolución comprobada.
- Los elementos fuera del viewport pertenecen exclusivamente a carruseles y permanecen recortados por sus contenedores, sin ampliar el ancho del documento.
- Los enlaces externos con `target="_blank"` utilizan `rel="noopener noreferrer"`.
- No quedan coincidencias de textos provisionales en contenidos publicados.

**Resultado:** auditoría responsive y técnica cerrada sin incidencias bloqueantes reproducibles.