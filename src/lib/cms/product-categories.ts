import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import type { ProductCategory } from "./types";
import { logAction } from "./history-logs";

const TABLE = "product_categories";
const FILE_NAME = "product-categories.json";
const DATA_DIR = path.join(process.cwd(), "data");

type CatInput = Partial<Omit<ProductCategory, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null };

function toSlug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function uniqueSlug(items: ProductCategory[], base: string, currentId?: string) {
  const taken = new Set(items.filter((c) => c.id !== currentId).map((c) => c.slug));
  if (!taken.has(base)) return base; let i = 2; while (taken.has(`${base}-${i}`)) i++; return `${base}-${i}`;
}

function normalize(input: CatInput, existing?: ProductCategory, all: ProductCategory[] = []) {
  const now = new Date().toISOString(); const name = String(input.name ?? existing?.name ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");
  const slug = uniqueSlug(all, String(input.slug ?? existing?.slug ?? "").trim() || toSlug(name), existing?.id);
  return { id: existing?.id ?? input.id ?? randomUUID(), name, slug, description: String(input.description ?? existing?.description ?? "").trim(), image_id: String(input.image_id ?? existing?.image_id ?? "").trim(), status: input.status ?? existing?.status ?? "active", sort_order: input.sort_order ?? existing?.sort_order ?? 0, created_at: existing?.created_at ?? now, updated_at: now, deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null } satisfies ProductCategory;
}

// ── Mapping helpers ──

function rowToCategory(row: Record<string, unknown>): ProductCategory {
  return row as unknown as ProductCategory;
}

function categoryToRow(cat: ProductCategory): Record<string, unknown> {
  return { ...cat };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<ProductCategory[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToCategory);
  } catch {
    return null;
  }
}

async function readLocalCategories(): Promise<ProductCategory[]> {
  try {
    const raw = await readFile(path.join(DATA_DIR, FILE_NAME), "utf8");
    return JSON.parse(raw) as ProductCategory[];
  } catch {
    return [];
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<ProductCategory | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToCategory(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertCategory(cat: ProductCategory): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(categoryToRow(cat), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteCategoryFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getCategories() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  const local = await readLocalCategories();
  return local.length ? local : readJsonFile<ProductCategory[]>(FILE_NAME, []);
}

export async function getCategoryById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  return items.find((c) => c.id === id) ?? null;
}

export async function createCategory(data: CatInput) {
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  const next = normalize(data, undefined, items);
  await writeJsonFile(FILE_NAME, [next, ...items]);
  await upsertCategory(next);
  await logAction({ action: "create", entity_type: "product_category", entity_id: next.id, entity_title: next.name, new_data: next });
  return next;
}

export async function updateCategory(id: string, data: CatInput) {
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const old = items[index];
  const next = normalize(data, old, items);
  items[index] = next;
  await writeJsonFile(FILE_NAME, items);
  await upsertCategory(next);
  await logAction({ action: "update", entity_type: "product_category", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  return next;
}

export async function moveCategoryToTrash(id: string, dBy?: string) {
  const resolvedBy = dBy ?? await getCurrentUserEmail();
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const c = items[index];
  const d = new Date().toISOString();
  const t: ProductCategory = { ...c, status: "deleted", deleted_at: d, updated_at: d };
  items[index] = t;
  await writeJsonFile(FILE_NAME, items);
  await upsertCategory(t);
  await addTrashItem({ id: randomUUID(), entity_type: "product_category", entity_id: c.id, title: c.name, deleted_by: resolvedBy, deleted_at: d, restore_data: c });
  await logAction({ action: "trash", entity_type: "product_category", entity_id: c.id, entity_title: c.name, old_data: c, user_email: resolvedBy });
  return t;
}

export async function restoreCategory(id: string) {
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  const index = items.findIndex((c) => c.id === id);
  const trashItem = await getTrashItemByEntity(id);
  if (index === -1 && !trashItem) return null;
  const r = trashItem?.restore_data && typeof trashItem.restore_data === "object"
    ? ({ ...(trashItem.restore_data as ProductCategory), status: "active", deleted_at: null, updated_at: new Date().toISOString() } as ProductCategory)
    : ({ ...items[index], status: "active", deleted_at: null, updated_at: new Date().toISOString() } as ProductCategory);
  if (index === -1) { const a = await readJsonFile<ProductCategory[]>(FILE_NAME, []); a.unshift(r); await writeJsonFile(FILE_NAME, a); }
  else { items[index] = r; await writeJsonFile(FILE_NAME, items); }
  await upsertCategory(r);
  if (trashItem) await removeTrashItem(trashItem.id);
  await logAction({ action: "restore", entity_type: "product_category", entity_id: r.id, entity_title: r.name });
  return r;
}

export async function deleteCategoryPermanently(id: string) {
  const items = await readJsonFile<ProductCategory[]>(FILE_NAME, []);
  const item = items.find((c) => c.id === id);
  const next = items.filter((c) => c.id !== id);
  if (next.length === items.length) return false;
  await writeJsonFile(FILE_NAME, next);
  await deleteCategoryFromDb(id);
  const t = await getTrashItemByEntity(id);
  if (t) await removeTrashItem(t.id);
  if (item) await logAction({ action: "delete_permanently", entity_type: "product_category", entity_id: id, entity_title: item.name, old_data: item });
  return true;
}
