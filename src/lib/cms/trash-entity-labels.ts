import type { TrashItem } from "./types";

export type TrashEntityOption = {
  value: string;
  label: string;
};

const ENTITY_LABELS: Record<string, string> = {
  admin_user: "Usuarios administradores",
  blog_post: "Bitácora",
  coupon: "Cupones shop",
  faq: "Preguntas frecuentes",
  footer: "Footer",
  form: "Formularios",
  form_submission: "Mensajes de formularios",
  header: "Encabezados",
  landing_page: "Landing pages",
  media: "Biblioteca de medios",
  menu: "Menús",
  offering: "Clases, workshops, experiencias y gift cards",
  "offering:class": "Clases",
  "offering:experience": "Experiencias",
  "offering:gift_card": "Gift Cards",
  "offering:workshop": "Workshops",
  order: "Pedidos shop",
  page: "Páginas",
  product: "Productos shop",
  product_category: "Categorías shop",
  promo_banner: "Banners promocionales",
  redirect: "Redirecciones",
  reservation: "Reservas",
  shipping_method: "Métodos de envío shop",
  social_gallery: "Galería social",
  teacher: "Profesores",
  testimonial: "Testimonios",
};

function humanizeEntityType(entityType: string) {
  return entityType
    .replace(/^offering:/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function restoreDataRecord(item: TrashItem) {
  return item.restore_data && typeof item.restore_data === "object" && !Array.isArray(item.restore_data)
    ? item.restore_data as Record<string, unknown>
    : null;
}

export function getTrashEntityFilterValue(item: TrashItem) {
  if (item.entity_type !== "offering") return item.entity_type;

  const type = restoreDataRecord(item)?.type;
  if (type === "class" || type === "workshop" || type === "experience" || type === "gift_card") {
    return `offering:${type}`;
  }

  return item.entity_type;
}

export function getTrashEntityLabel(valueOrItem: string | TrashItem) {
  const value = typeof valueOrItem === "string" ? valueOrItem : getTrashEntityFilterValue(valueOrItem);
  return ENTITY_LABELS[value] ?? humanizeEntityType(value);
}

export function buildTrashEntityOptions(items: TrashItem[]): TrashEntityOption[] {
  const values = Array.from(new Set(items.map(getTrashEntityFilterValue))).filter(Boolean);
  return values
    .map((value) => ({ value, label: getTrashEntityLabel(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}
