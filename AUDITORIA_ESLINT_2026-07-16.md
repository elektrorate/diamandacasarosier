# Auditoría detallada de advertencias ESLint

**Fecha:** 16 de julio de 2026  
**Total:** 57 advertencias en 31 archivos  
**Regla:** `@typescript-eslint/no-unused-vars`  
**Errores bloqueantes:** 0

## Criterio de prioridad

- **P2:** código o importaciones sin uso que pueden ocultar funcionalidad abandonada y conviene limpiar.
- **P3:** parámetros o desestructuraciones que pueden ser intencionales; requieren revisión antes de eliminarlos.

## Resumen por categoría

| Categoría | Cantidad | Acción |
|---|---:|---|
| Importación o tipo sin uso | 38 | Limpieza normalmente segura |
| Desestructuración o variable intermedia | 14 | Revisión funcional obligatoria |
| Parámetro o propiedad no utilizada | 5 | Revisar contrato y eliminar si procede |

## Inventario completo

### 1. [P2] `notFound`

- **Archivo:** `src/app/admin/menu/[id]/edit/page.tsx:1:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'notFound' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 2. [P2] `getLandingPageById`

- **Archivo:** `src/app/api/admin/landing-pages/[id]/blocks/route.ts:2:31`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'getLandingPageById' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 3. [P2] `randomUUID`

- **Archivo:** `src/components/admin/FormForm.tsx:7:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'randomUUID' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 4. [P2] `Link`

- **Archivo:** `src/components/admin/HeaderForm.tsx:4:8`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'Link' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 5. [P2] `HeaderType`

- **Archivo:** `src/components/admin/HeaderForm.tsx:11:43`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'HeaderType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 6. [P2] `HEADER_STATUSES`

- **Archivo:** `src/components/admin/HeaderForm.tsx:12:24`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'HEADER_STATUSES' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 7. [P2] `MediaFolder`

- **Archivo:** `src/components/admin/MediaEditModal.tsx:4:27`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'MediaFolder' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 8. [P2] `PageType`

- **Archivo:** `src/components/admin/PageForm.tsx:5:29`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'PageType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 9. [P2] `PageType`

- **Archivo:** `src/components/admin/PagesTable.tsx:4:21`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'PageType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 10. [P2] `BlogHeroContent`

- **Archivo:** `src/features/blog/BlogIndexPage.tsx:12:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'BlogHeroContent' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 11. [P2] `Image`

- **Archivo:** `src/features/blog/BlogPostPage.tsx:1:8`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'Image' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 12. [P2] `MarkdownContent`

- **Archivo:** `src/features/blog/BlogPostPage.tsx:4:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'MarkdownContent' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 13. [P2] `formatDate`

- **Archivo:** `src/features/blog/BlogPostPage.tsx:9:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'formatDate' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 14. [P2] `ShopHeroContent`

- **Archivo:** `src/features/shop/ShopIndexPage.tsx:10:10`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'ShopHeroContent' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 15. [P2] `Image`

- **Archivo:** `src/features/studio/StudioPage.tsx:1:8`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'Image' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 16. [P2] `validateLocalCredentials`

- **Archivo:** `src/lib/auth/local-auth.ts:3:55`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'validateLocalCredentials' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 17. [P2] `DiscountType`

- **Archivo:** `src/lib/cms/coupons.ts:6:37`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'DiscountType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 18. [P2] `CouponStatus`

- **Archivo:** `src/lib/cms/coupons.ts:6:23`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'CouponStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 19. [P2] `FaqStatus`

- **Archivo:** `src/lib/cms/faqs.ts:6:20`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'FaqStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 20. [P2] `FormType`

- **Archivo:** `src/lib/cms/forms.ts:6:59`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'FormType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 21. [P2] `FormFieldType`

- **Archivo:** `src/lib/cms/forms.ts:6:32`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'FormFieldType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 22. [P2] `FormStatus`

- **Archivo:** `src/lib/cms/forms.ts:6:47`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'FormStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 23. [P2] `FormSubmissionStatus`

- **Archivo:** `src/lib/cms/form-submissions.ts:6:31`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'FormSubmissionStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 24. [P2] `HeaderStatus`

- **Archivo:** `src/lib/cms/headers.ts:6:43`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'HeaderStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 25. [P2] `HeaderType`

- **Archivo:** `src/lib/cms/headers.ts:6:57`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'HeaderType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 26. [P2] `isBlockType`

- **Archivo:** `src/lib/cms/landing-pages.ts:5:47`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'isBlockType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 27. [P2] `LandingPageStatus`

- **Archivo:** `src/lib/cms/landing-pages.ts:6:28`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'LandingPageStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 28. [P2] `BlockType`

- **Archivo:** `src/lib/cms/landing-pages.ts:6:61`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'BlockType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 29. [P2] `CampaignType`

- **Archivo:** `src/lib/cms/landing-pages.ts:6:47`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'CampaignType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 30. [P2] `OrderPaymentStatus`

- **Archivo:** `src/lib/cms/orders.ts:6:33`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'OrderPaymentStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 31. [P2] `OrderStatus`

- **Archivo:** `src/lib/cms/orders.ts:6:53`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'OrderStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 32. [P2] `PageStatus`

- **Archivo:** `src/lib/cms/pages.ts:6:21`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'PageStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 33. [P2] `PageType`

- **Archivo:** `src/lib/cms/pages.ts:6:33`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'PageType' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 34. [P2] `ReservationStatus`

- **Archivo:** `src/lib/cms/reservations.ts:6:54`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'ReservationStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 35. [P2] `ReservationPaymentStatus`

- **Archivo:** `src/lib/cms/reservations.ts:6:28`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'ReservationPaymentStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 36. [P2] `ShippingMethodStatus`

- **Archivo:** `src/lib/cms/shipping.ts:6:31`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'ShippingMethodStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 37. [P2] `TeacherStatus`

- **Archivo:** `src/lib/cms/teachers.ts:6:24`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'TeacherStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 38. [P2] `TestimonialStatus`

- **Archivo:** `src/lib/cms/testimonials.ts:6:28`
- **Categoría:** Importación o tipo sin uso
- **ESLint:** 'TestimonialStatus' is defined but never used.
- **Recomendación:** Eliminar la importación y ejecutar TypeScript, ESLint y build.

### 39. [P3] `request`

- **Archivo:** `src/app/api/admin/settings/route.ts:5:27`
- **Categoría:** Parámetro o propiedad no utilizada
- **ESLint:** 'request' is defined but never used.
- **Recomendación:** Eliminar el parámetro si no forma parte del contrato, o marcarlo explícitamente como intencional.

### 40. [P3] `request`

- **Archivo:** `src/app/api/admin/shop/categories/route.ts:5:27`
- **Categoría:** Parámetro o propiedad no utilizada
- **ESLint:** 'request' is defined but never used.
- **Recomendación:** Eliminar el parámetro si no forma parte del contrato, o marcarlo explícitamente como intencional.

### 41. [P3] `request`

- **Archivo:** `src/app/api/admin/shop/coupons/route.ts:5:27`
- **Categoría:** Parámetro o propiedad no utilizada
- **ESLint:** 'request' is defined but never used.
- **Recomendación:** Eliminar el parámetro si no forma parte del contrato, o marcarlo explícitamente como intencional.

### 42. [P3] `request`

- **Archivo:** `src/app/api/admin/shop/shipping/route.ts:5:27`
- **Categoría:** Parámetro o propiedad no utilizada
- **ESLint:** 'request' is defined but never used.
- **Recomendación:** Eliminar el parámetro si no forma parte del contrato, o marcarlo explícitamente como intencional.

### 43. [P3] `all`

- **Archivo:** `src/app/api/admin/shop/shipping/route.ts:25:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'all' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 44. [P3] `menuId`

- **Archivo:** `src/components/admin/MenuItemForm.tsx:19:61`
- **Categoría:** Parámetro o propiedad no utilizada
- **ESLint:** 'menuId' is defined but never used.
- **Recomendación:** Eliminar el parámetro si no forma parte del contrato, o marcarlo explícitamente como intencional.

### 45. [P3] `className`

- **Archivo:** `src/components/ui/Checkbox.tsx:7:43`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'className' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 46. [P3] `_blogPostId`

- **Archivo:** `src/lib/cms/blog.ts:123:25`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** '_blogPostId' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 47. [P3] `_blocks`

- **Archivo:** `src/lib/cms/blog.ts:153:19`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** '_blocks' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 48. [P3] `form_id`

- **Archivo:** `src/lib/cms/forms.ts:85:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'form_id' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 49. [P3] `updated_at`

- **Archivo:** `src/lib/cms/forms.ts:85:32`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'updated_at' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 50. [P3] `created_at`

- **Archivo:** `src/lib/cms/forms.ts:85:20`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'created_at' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 51. [P3] `fields`

- **Archivo:** `src/lib/cms/forms.ts:104:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'fields' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 52. [P3] `source_url`

- **Archivo:** `src/lib/cms/landing-pages.ts:61:28`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'source_url' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 53. [P3] `landing_page_id`

- **Archivo:** `src/lib/cms/landing-pages.ts:61:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'landing_page_id' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 54. [P3] `blocks`

- **Archivo:** `src/lib/cms/landing-pages.ts:105:13`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'blocks' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 55. [P3] `created_at`

- **Archivo:** `src/lib/cms/orders.ts:50:21`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'created_at' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 56. [P3] `order_id`

- **Archivo:** `src/lib/cms/orders.ts:50:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'order_id' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

### 57. [P3] `items`

- **Archivo:** `src/lib/cms/orders.ts:66:11`
- **Categoría:** Desestructuración o variable intermedia
- **ESLint:** 'items' is assigned a value but never used.
- **Recomendación:** Revisar antes de eliminar: puede estar excluyendo campos al construir un objeto.

## Orden recomendado de corrección

1. Eliminar importaciones y tipos sin uso, validando cada grupo de archivos.
2. Revisar componentes con funcionalidad visual aparentemente abandonada.
3. Revisar parámetros no usados sin romper contratos de rutas o componentes.
4. Conservar o reescribir desestructuraciones usadas para excluir campos de persistencia.
5. Ejecutar `npm run typecheck`, `npm run lint` y `npm run build`.

## Estado

Este documento identifica y clasifica las advertencias; no implica que todas puedan eliminarse automáticamente. Las entradas P3 deben revisarse individualmente para evitar reintroducir campos internos en los datos persistidos.
