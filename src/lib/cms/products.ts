import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isProductStatus } from "./types";
import type { Product } from "./types";
import { logAction } from "./history-logs";

const TABLE = "products";
const FILE_NAME = "products.json";
const DATA_DIR = path.join(process.cwd(), "data");

type ProductInput = Partial<Omit<Product, "id" | "created_at" | "updated_at" | "deleted_at">> & {
  id?: string;
  deleted_at?: string | null;
};

function toSlug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

function skuFromName(value: string) {
  const base = toSlug(value).replace(/-/g, "").toUpperCase();
  return base ? `CR-${base.slice(0, 18)}` : "";
}

function uniqueSlug(items: Product[], base: string, currentId?: string) {
  const taken = new Set(items.filter((p) => p.id !== currentId).map((p) => p.slug));
  if (!taken.has(base)) return base;
  let c = 2; while (taken.has(`${base}-${c}`)) c++; return `${base}-${c}`;
}

function normalizeProduct(input: ProductInput, existing?: Product, allItems: Product[] = []) {
  const now = new Date().toISOString();
  const name = String(input.name ?? existing?.name ?? "").trim();
  const slugBase = toSlug(String(input.slug ?? existing?.slug ?? "").trim()) || toSlug(name);
  const slug = uniqueSlug(allItems, slugBase || toSlug(name), existing?.id);
  const status = input.status ?? existing?.status ?? "draft";
  const price = input.price !== undefined ? input.price : (existing?.price ?? null);
  const stock = input.stock !== undefined ? input.stock : (existing?.stock ?? null);
  const lowStockThreshold = input.low_stock_threshold ?? existing?.low_stock_threshold ?? 5;

  if (!name) throw new Error("El nombre es obligatorio.");
  if (!isProductStatus(status)) throw new Error("Estado no válido.");
  if (price !== null && (!Number.isFinite(Number(price)) || Number(price) < 0)) throw new Error("Precio no válido.");
  if (stock !== null && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) throw new Error("Stock no válido.");
  if (!Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) throw new Error("Stock mínimo no válido.");

  return {
    id: existing?.id ?? input.id ?? randomUUID(), status, name, slug,
    sku: String(input.sku ?? "").trim() || skuFromName(name) || (existing?.sku ?? ""),
    description: String(input.description ?? existing?.description ?? "").trim(),
    excerpt: String(input.excerpt ?? existing?.excerpt ?? "").trim(),
    main_image_id: String(input.main_image_id ?? existing?.main_image_id ?? "").trim(),
    gallery: Array.isArray(input.gallery ?? existing?.gallery) ? [...(input.gallery ?? existing?.gallery ?? [])] : [],
    price,
    compare_at_price: input.compare_at_price !== undefined ? input.compare_at_price : (existing?.compare_at_price ?? null),
    stock,
    low_stock_threshold: lowStockThreshold,
    category_id: String(input.category_id ?? existing?.category_id ?? "").trim(),
    characteristics: String(input.characteristics ?? existing?.characteristics ?? "").trim(),
    weight: String(input.weight ?? existing?.weight ?? "").trim(),
    dimensions: String(input.dimensions ?? existing?.dimensions ?? "").trim(),
    cta_label: String(input.cta_label ?? existing?.cta_label ?? "").trim(),
    cta_url: String(input.cta_url ?? existing?.cta_url ?? "").trim(),
    seo_title: String(input.seo_title ?? existing?.seo_title ?? "").trim(),
    seo_description: String(input.seo_description ?? existing?.seo_description ?? "").trim(),
    seo_image: String(input.seo_image ?? existing?.seo_image ?? "").trim(),
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null,
  } satisfies Product;
}

// ── Mapping helpers ──

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    ...row,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    price: row.price ?? null,
    compare_at_price: row.compare_at_price ?? null,
    stock: row.stock ?? null,
    low_stock_threshold: row.low_stock_threshold ?? 5,
    cta_label: typeof row.cta_label === "string" ? row.cta_label : "",
    cta_url: typeof row.cta_url === "string" ? row.cta_url : "",
  } as unknown as Product;
}

function productToRow(product: Product): Record<string, unknown> {
  return { ...product };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<Product[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToProduct);
  } catch {
    return null;
  }
}

async function readLocalProducts(): Promise<Product[]> {
  try {
    const raw = await readFile(path.join(DATA_DIR, FILE_NAME), "utf8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Product | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToProduct(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertProduct(product: Product): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(productToRow(product), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteProductFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getProducts() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  const local = await readLocalProducts();
  return local.length ? local : readJsonFile<Product[]>(FILE_NAME, []);
}

export async function getProductById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const items = await readJsonFile<Product[]>(FILE_NAME, []);
  return items.find((p) => p.id === id) ?? null;
}

export async function getProductBySlug(slug: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("slug", slug).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const items = await readJsonFile<Product[]>(FILE_NAME, []);
  return items.find((p) => p.slug === slug) ?? null;
}

export async function createProduct(data: ProductInput) {
  const items = await getProducts();
  const next = normalizeProduct(data, undefined, items);
  await writeJsonFile(FILE_NAME, [next, ...items]);
  await upsertProduct(next);
  await logAction({ action: "create", entity_type: "product", entity_id: next.id, entity_title: next.name, new_data: next });
  return next;
}

export async function updateProduct(id: string, data: ProductInput) {
  const items = await getProducts();
  const index = items.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const old = items[index];
  const next = normalizeProduct(data, old, items);
  items[index] = next;
  await writeJsonFile(FILE_NAME, items);
  await upsertProduct(next);
  if (old.status !== next.status) {
    if (next.status === "published") await logAction({ action: "publish", entity_type: "product", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
    else if (old.status === "published") await logAction({ action: "unpublish", entity_type: "product", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  }
  await logAction({ action: "update", entity_type: "product", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  return next;
}

export async function duplicateProduct(id: string) {
  const items = await getProducts();
  const original = items.find((p) => p.id === id);
  if (!original) return null;
  const copy = normalizeProduct({ ...original, name: `${original.name} (copia)`, slug: "", status: "draft" }, undefined, items);
  await writeJsonFile(FILE_NAME, [copy, ...items]);
  await upsertProduct(copy);
  await logAction({ action: "duplicate", entity_type: "product", entity_id: original.id, entity_title: original.name, new_data: copy });
  return copy;
}

export async function moveProductToTrash(id: string, deletedBy?: string) {
  const dBy = deletedBy ?? await getCurrentUserEmail();
  const items = await readJsonFile<Product[]>(FILE_NAME, []);
  const index = items.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const current = items[index];
  const deletedAt = new Date().toISOString();
  const trashed: Product = { ...current, status: "deleted", deleted_at: deletedAt, updated_at: deletedAt };
  items[index] = trashed;
  await writeJsonFile(FILE_NAME, items);
  await upsertProduct(trashed);
  await addTrashItem({ id: randomUUID(), entity_type: "product", entity_id: current.id, title: current.name, deleted_by: dBy, deleted_at: deletedAt, restore_data: current });
  await logAction({ action: "trash", entity_type: "product", entity_id: current.id, entity_title: current.name, old_data: current, user_email: dBy });
  return trashed;
}

export async function restoreProduct(id: string) {
  const items = await readJsonFile<Product[]>(FILE_NAME, []);
  const index = items.findIndex((p) => p.id === id);
  const trashItem = await getTrashItemByEntity(id);
  if (index === -1 && !trashItem) return null;
  const restored = trashItem?.restore_data && typeof trashItem.restore_data === "object"
    ? ({ ...(trashItem.restore_data as Product), status: "draft", deleted_at: null, updated_at: new Date().toISOString() } as Product)
    : ({ ...items[index], status: "draft", deleted_at: null, updated_at: new Date().toISOString() } as Product);
  if (index === -1) { const all = await readJsonFile<Product[]>(FILE_NAME, []); all.unshift(restored); await writeJsonFile(FILE_NAME, all); }
  else { items[index] = restored; await writeJsonFile(FILE_NAME, items); }
  await upsertProduct(restored);
  if (trashItem) await removeTrashItem(trashItem.id);
  await logAction({ action: "restore", entity_type: "product", entity_id: restored.id, entity_title: restored.name });
  return restored;
}

export async function deleteProductPermanently(id: string) {
  const items = await readJsonFile<Product[]>(FILE_NAME, []);
  const item = items.find((p) => p.id === id);
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  await writeJsonFile(FILE_NAME, next);
  await deleteProductFromDb(id);
  const trashItem = await getTrashItemByEntity(id);
  if (trashItem) await removeTrashItem(trashItem.id);
  if (item) await logAction({ action: "delete_permanently", entity_type: "product", entity_id: id, entity_title: item.name, old_data: item });
  return true;
}

export async function getLowStockProducts(threshold = 5) {
  const items = await getProducts();
  return items.filter((p) => p.stock !== null && p.stock <= (p.low_stock_threshold || threshold) && p.status !== "deleted");
}
