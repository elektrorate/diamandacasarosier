import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { buildTrashEntityOptions, getTrashEntityFilterValue, getTrashEntityLabel, type TrashEntityOption } from "./trash-entity-labels";
import type { TrashItem } from "./types";

const TABLE = "trash_items";
const FILE_NAME = "trash.json";
export type TrashDateSort = "newest" | "oldest";
export type PaginatedTrashItems = {
  items: TrashItem[];
  entityOptions: TrashEntityOption[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: TrashDateSort;
  entityType: string;
  query: string;
};

export type TrashPageOptions = {
  page?: number;
  pageSize?: number;
  sort?: TrashDateSort;
  entityType?: string;
  query?: string;
};

function normalizePagination(page = 1, pageSize = 30) {
  const safePageSize = Math.min(Math.max(Number(pageSize) || 30, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  return { page: safePage, pageSize: safePageSize };
}

// ── Mapping helpers ──

function rowToTrashItem(row: Record<string, unknown>): TrashItem {
  return {
    ...row,
    restore_data: row.restore_data ?? null,
  } as unknown as TrashItem;
}

function trashItemToRow(item: TrashItem): Record<string, unknown> {
  return { ...item };
}

// ── User helper ──

export async function getCurrentUserEmail(): Promise<string> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) return user.email;
  } catch { /* not in request context */ }
  return "system";
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<TrashItem[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToTrashItem);
  } catch {
    return null;
  }
}

async function upsertTrashItem(item: TrashItem): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(trashItemToRow(item), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteTrashItemFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getTrashItems() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readJsonFile<TrashItem[]>(FILE_NAME, []);
}

export async function getTrashItemsPage(options: TrashPageOptions = {}): Promise<PaginatedTrashItems> {
  const { page, pageSize } = normalizePagination(options.page, options.pageSize);
  const sort: TrashDateSort = options.sort === "oldest" ? "oldest" : "newest";
  const entityType = options.entityType && options.entityType !== "all" ? options.entityType : "all";
  const queryText = String(options.query ?? "").trim();
  const from = (page - 1) * pageSize;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    let items = (data ?? []).map(rowToTrashItem);
    const entityOptions = buildTrashEntityOptions(items);

    if (entityType !== "all") items = items.filter((item) => getTrashEntityFilterValue(item) === entityType);
    if (queryText) {
      const search = queryText.toLowerCase();
      items = items.filter((item) => [
        item.title,
        item.entity_type,
        getTrashEntityLabel(item),
        item.deleted_by,
        item.deleted_at,
      ].join(" ").toLowerCase().includes(search));
    }
    items = items.sort((a, b) => {
      const diff = Date.parse(a.deleted_at) - Date.parse(b.deleted_at);
      return sort === "oldest" ? diff : -diff;
    });
    const total = items.length;
    return {
      items: items.slice(from, from + pageSize),
      entityOptions,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      sort,
      entityType,
      query: queryText,
    };
  } catch {
    let items = await readJsonFile<TrashItem[]>(FILE_NAME, []);
    const entityOptions = buildTrashEntityOptions(items);
    if (entityType !== "all") items = items.filter((item) => getTrashEntityFilterValue(item) === entityType);
    if (queryText) {
      const search = queryText.toLowerCase();
      items = items.filter((item) => [item.title, item.entity_type, getTrashEntityLabel(item), item.deleted_by, item.deleted_at].join(" ").toLowerCase().includes(search));
    }
    items = items.sort((a, b) => {
      const diff = Date.parse(a.deleted_at) - Date.parse(b.deleted_at);
      return sort === "oldest" ? diff : -diff;
    });
    const total = items.length;
    return {
      items: items.slice(from, from + pageSize),
      entityOptions,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      sort,
      entityType,
      query: queryText,
    };
  }
}

export async function addTrashItem(item: TrashItem) {
  const items = await readJsonFile<TrashItem[]>(FILE_NAME, []);
  const next = [item, ...items.filter((current) => current.id !== item.id)];
  await writeJsonFile(FILE_NAME, next);
  await upsertTrashItem(item);
  return item;
}

export async function removeTrashItem(id: string) {
  const items = await readJsonFile<TrashItem[]>(FILE_NAME, []);
  const next = items.filter((item) => item.id !== id);
  await writeJsonFile(FILE_NAME, next);
  await deleteTrashItemFromDb(id);
}

export async function getTrashItemByEntity(entityId: string) {
  // Try Supabase first
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from(TABLE).select("*").eq("entity_id", entityId).maybeSingle();
    if (data) return rowToTrashItem(data as Record<string, unknown>);
  } catch { /* fall through */ }
  const items = await readJsonFile<TrashItem[]>(FILE_NAME, []);
  return items.find((item) => item.entity_id === entityId) ?? null;
}

// Esta capa se reemplazará por Supabase cuando el CMS salga de modo local.
