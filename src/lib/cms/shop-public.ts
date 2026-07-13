import type { ShopCategory, ShopItem } from "@/data/types";
import { getCategories } from "./product-categories";
import { getProducts } from "./products";
import type { Product, ProductCategory } from "./types";

function formatPrice(value: number | null) {
  return value === null ? "Consultar" : `${value} EUR`;
}

function findCategory(product: Product, categories: ProductCategory[]) {
  return categories.find((item) => item.id === product.category_id || item.slug === product.category_id);
}

function categoryKey(product: Product, categories: ProductCategory[]) {
  return findCategory(product, categories)?.id ?? product.category_id ?? "general";
}

function categoryLabel(product: Product, categories: ProductCategory[]) {
  const category = findCategory(product, categories);
  return category?.name ?? "Pieza unica";
}

function detailsFromProduct(product: Product) {
  const details: Record<string, string> = {};
  if (product.sku) details.SKU = product.sku;
  if (product.weight) details.Peso = product.weight;
  if (product.dimensions) details.Medidas = product.dimensions;
  if (product.characteristics) details.Caracteristicas = product.characteristics;
  return details;
}

function orderFromProduct(product: Product) {
  const match = product.sku.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function productToShopItem(product: Product, categories: ProductCategory[]): ShopItem {
  const gallery = [product.main_image_id, ...(product.gallery ?? [])].filter(Boolean);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: categoryKey(product, categories),
    categoryLabel: categoryLabel(product, categories),
    price: formatPrice(product.price),
    availability: product.stock === null || product.stock > 0 ? "Disponible" : "Agotado",
    image: product.main_image_id || product.seo_image || gallery[0] || "/img/social-2.jpg",
    gallery,
    description: product.description || product.excerpt,
    details: detailsFromProduct(product),
    availabilityNote: product.excerpt || (product.stock === null ? "" : `${product.stock} disponible(s)`),
    seoTitle: product.seo_title || `${product.name} | Casa Rosier`,
    seoDescription: product.seo_description || product.excerpt || product.description,
    order: orderFromProduct(product),
    isPublished: product.status === "published",
  };
}

export async function getPublicShopData() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const published = products
    .filter((product) => product.status === "published" && product.deleted_at === null)
    .map((product) => productToShopItem(product, categories))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const shopCategories: ShopCategory[] = [
    { key: "all", label: "Todas" },
    ...categories
      .filter((category) => category.status === "active" && category.deleted_at === null)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .map((category) => ({ key: category.id, label: category.name })),
  ];

  return { published, shopCategories };
}

export async function getPublicShopItemBySlug(slug: string) {
  const { published } = await getPublicShopData();
  return published.find((item) => item.slug === slug) ?? null;
}
