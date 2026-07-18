import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { isMediaFolder, isMediaStatus } from "./types";
import type { MediaAsset } from "./types";
import { logAction } from "./history-logs";

const TABLE = "media_assets";
const STORAGE_BUCKET = "media";
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"]);
const MEDIA_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "mp4", "webm", "mov", "m4v", "pdf"]);

export function isMediaImage(asset: Pick<MediaAsset, "file_type" | "mime_type">) {
  return IMAGE_EXTENSIONS.has(asset.file_type.toLowerCase()) || asset.mime_type.toLowerCase().startsWith("image/");
}

function storagePathFromAssetId(id: string) {
  return id.startsWith("storage:") ? id.slice("storage:".length) : null;
}

type MediaInput = Partial<Omit<MediaAsset, "id" | "created_at" | "updated_at" | "deleted_at">> & {
  id?: string;
};

export type MediaTypeFilter = "all" | "image" | "video" | "document";
export type MediaSort = "newest" | "oldest" | "name";

export interface MediaListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  folder?: string;
  status?: MediaAsset["status"];
  type?: MediaTypeFilter;
  sort?: MediaSort;
}

export interface MediaListResult {
  assets: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const MEDIA_LIST_PAGE_SIZE = 24;
const MEDIA_LIST_MAX_PAGE_SIZE = 48;

function normalizeAsset(input: MediaInput, existing?: MediaAsset) {
  const now = new Date().toISOString();
  const folder = input.folder ?? existing?.folder ?? "general";
  const status = input.status ?? existing?.status ?? "active";

  if (!isMediaFolder(folder)) {
    throw new Error("Folder de media no válido.");
  }
  if (!isMediaStatus(status)) {
    throw new Error("Estado de media no válido.");
  }

  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    file_name: String(input.file_name ?? existing?.file_name ?? "").trim(),
    original_name: String(input.original_name ?? existing?.original_name ?? "").trim(),
    file_url: String(input.file_url ?? existing?.file_url ?? "").trim(),
    file_type: String(input.file_type ?? existing?.file_type ?? "").trim().toLowerCase(),
    mime_type: String(input.mime_type ?? existing?.mime_type ?? "").trim().toLowerCase(),
    size: input.size !== undefined ? Number(input.size) : existing?.size ?? 0,
    alt_text: String(input.alt_text ?? existing?.alt_text ?? "").trim(),
    title: String(input.title ?? existing?.title ?? "").trim(),
    description: String(input.description ?? existing?.description ?? "").trim(),
    folder,
    tags: Array.isArray(input.tags ?? existing?.tags) ? (input.tags ?? existing?.tags ?? []).map(String) : [],
    status,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null,
  } satisfies MediaAsset;
}

// ── Mapping helpers ──

function rowToMediaAsset(row: Record<string, unknown>): MediaAsset {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
  } as unknown as MediaAsset;
}

function mediaAssetToRow(a: MediaAsset): Record<string, unknown> {
  return { ...a };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<MediaAsset[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToMediaAsset);
  } catch {
    return null;
  }
}

async function listStorageFiles(prefix = ""): Promise<MediaAsset[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (error || !data) return [];

    const nested = await Promise.all(data.map(async (item) => {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      const metadata = item.metadata as { mimetype?: string; size?: number } | null | undefined;

      if (!metadata) {
        return listStorageFiles(itemPath);
      }

      const ext = item.name.split(".").pop()?.toLowerCase() || "";
      if (!MEDIA_EXTENSIONS.has(ext)) return [];

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(itemPath);
      const now = item.updated_at || item.created_at || new Date().toISOString();

      return [{
        id: `storage:${itemPath}`,
        file_name: itemPath,
        original_name: item.name,
        file_url: publicUrlData.publicUrl,
        file_type: ext,
        mime_type: metadata.mimetype || "",
        size: Number(metadata.size || 0),
        alt_text: "",
        title: item.name,
        description: "",
        folder: prefix || "media",
        tags: ["supabase-storage"],
        status: "active",
        created_at: item.created_at || now,
        updated_at: now,
        deleted_at: null,
      } satisfies MediaAsset];
    }));

    return nested.flat();
  } catch {
    return [];
  }
}

function uniqueAssets(assets: MediaAsset[]) {
  const byKey = new Map<string, MediaAsset>();

  for (const asset of assets) {
    const key = asset.file_url || asset.file_name || asset.id;
    const existing = byKey.get(key);
    if (!existing || (existing.status === "deleted" && asset.status !== "deleted")) {
      byKey.set(key, asset);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const folderCompare = a.folder.localeCompare(b.folder);
    if (folderCompare !== 0) return folderCompare;
    return a.original_name.localeCompare(b.original_name);
  });
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<MediaAsset | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToMediaAsset(row);
  } catch { /* fall through */ }
  return null;
}

async function getStorageAssetByPath(filePath: string): Promise<MediaAsset | null> {
  try {
    const supabase = createAdminClient();
    const lastSlashIndex = filePath.lastIndexOf("/");
    const prefix = lastSlashIndex >= 0 ? filePath.slice(0, lastSlashIndex) : "";
    const fileName = lastSlashIndex >= 0 ? filePath.slice(lastSlashIndex + 1) : filePath;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (error || !data) return null;

    const item = data.find((entry) => entry.name === fileName);
    if (!item) return null;

    const metadata = item.metadata as { mimetype?: string; size?: number } | null | undefined;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (!MEDIA_EXTENSIONS.has(ext)) return null;

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    const now = item.updated_at || item.created_at || new Date().toISOString();

    return {
      id: `storage:${filePath}`,
      file_name: filePath,
      original_name: fileName,
      file_url: publicUrlData.publicUrl,
      file_type: ext,
      mime_type: metadata?.mimetype || "",
      size: Number(metadata?.size || 0),
      alt_text: "",
      title: fileName,
      description: "",
      folder: prefix || "media",
      tags: ["supabase-storage"],
      status: "active",
      created_at: item.created_at || now,
      updated_at: now,
      deleted_at: null,
    };
  } catch {
    return null;
  }
}


async function deleteAssetFromDb(id: string, fileName?: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
    if (fileName) {
      await supabase.from(TABLE).delete().eq("file_name", fileName);
    }
  } catch { /* best-effort */ }
}

async function deleteFileFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    return !error;
  } catch {
    return false;
  }
}

// ── Public API ──

export async function listMediaAssets(options: MediaListOptions = {}): Promise<MediaListResult> {
  const requestedPage = Number.isFinite(options.page) ? Math.trunc(options.page ?? 1) : 1;
  const requestedPageSize = Number.isFinite(options.pageSize) ? Math.trunc(options.pageSize ?? MEDIA_LIST_PAGE_SIZE) : MEDIA_LIST_PAGE_SIZE;
  const page = Math.max(1, requestedPage);
  const pageSize = Math.min(MEDIA_LIST_MAX_PAGE_SIZE, Math.max(1, requestedPageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = options.search?.trim().slice(0, 120) ?? "";
  const sort = options.sort ?? "newest";
  const supabase = createAdminClient();

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .eq("status", options.status ?? "active");

  if (options.folder) query = query.eq("folder", options.folder);
  if (search) query = query.ilike("original_name", `%${search}%`);

  if (options.type === "image") {
    query = query.in("file_type", Array.from(IMAGE_EXTENSIONS));
  } else if (options.type === "video") {
    query = query.in("file_type", ["mp4", "webm", "mov", "m4v"]);
  } else if (options.type === "document") {
    query = query.eq("file_type", "pdf");
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true }).order("id", { ascending: true });
  } else if (sort === "name") {
    query = query.order("original_name", { ascending: true }).order("id", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    assets: ((data ?? []) as Array<Record<string, unknown>>).map(rowToMediaAsset),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMediaAssets() {
  const fromSupabase = await readAllFromSupabase();
  return uniqueAssets(fromSupabase ?? []);
}

export async function getUnregisteredStorageAssets() {
  const [registeredAssets, storageAssets] = await Promise.all([
    readAllFromSupabase(),
    listStorageFiles(),
  ]);
  const registeredNames = new Set((registeredAssets ?? []).map((asset) => asset.file_name));
  return storageAssets.filter((asset) => !registeredNames.has(asset.file_name));
}

export async function getMediaAssetById(id: string) {
  const storagePath = storagePathFromAssetId(id);
  if (storagePath) {
    const fromDb = await readFromSupabase(async (supabase) => {
      const { data } = await supabase.from(TABLE).select("*").eq("file_name", storagePath).maybeSingle();
      return data as Record<string, unknown> | null;
    });
    if (fromDb) return fromDb;

    const fromStorage = await getStorageAssetByPath(storagePath);
    if (fromStorage) return fromStorage;
  }

  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  return null;

}

export async function createMediaAsset(data: MediaInput) {
  const next = normalizeAsset(data);
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).insert(mediaAssetToRow(next));
  if (error) throw error;
  await logAction({ action: "create", entity_type: "media", entity_id: next.id, entity_title: next.original_name || next.file_name, new_data: next });
  return next;
}

export async function updateMediaAsset(id: string, data: MediaInput) {
  const current = await getMediaAssetById(id);
  if (!current) return null;
  const next = normalizeAsset(data, current);
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).update(mediaAssetToRow(next)).eq("id", current.id);
  if (error) throw error;
  await logAction({ action: "update", entity_type: "media", entity_id: next.id, entity_title: next.original_name || next.file_name, old_data: current, new_data: next });
  return next;
}

export async function deleteMediaAsset(id: string) {
  const asset = await getMediaAssetById(id);
  if (!asset) return false;

  const storageDeleted = await deleteFileFromStorage(asset.file_name);
  if (!storageDeleted) return false;

  await deleteAssetFromDb(asset.id, asset.file_name);
  const trashItem = await getTrashItemByEntity(asset.id);
  if (trashItem) await removeTrashItem(trashItem.id);

  await logAction({ action: "delete_permanently", entity_type: "media", entity_id: asset.id, entity_title: asset.original_name || asset.file_name, old_data: asset });
  return true;
}

export async function moveMediaToTrash(id: string, deletedBy?: string) {
  const current = await getMediaAssetById(id);
  if (!current) return null;

  const dBy = deletedBy ?? await getCurrentUserEmail();
  const deletedAt = new Date().toISOString();
  const trashed: MediaAsset = { ...current, status: "deleted", deleted_at: deletedAt, updated_at: deletedAt };
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).update(mediaAssetToRow(trashed)).eq("id", current.id);
  if (error) throw error;

  await addTrashItem({
    id: randomUUID(),
    entity_type: "media",
    entity_id: current.id,
    title: current.original_name || current.file_name,
    deleted_by: dBy,
    deleted_at: deletedAt,
    restore_data: current,
  });
  await logAction({ action: "trash", entity_type: "media", entity_id: current.id, entity_title: current.original_name || current.file_name, old_data: current, user_email: dBy });
  return trashed;
}

export async function restoreMediaAsset(id: string) {
  const [current, trashItem] = await Promise.all([
    getMediaAssetById(id),
    getTrashItemByEntity(id),
  ]);
  if (!current && !trashItem) return null;

  const source = trashItem?.restore_data && typeof trashItem.restore_data === "object"
    ? trashItem.restore_data as MediaAsset
    : current as MediaAsset;
  const restored: MediaAsset = { ...source, status: "active", deleted_at: null, updated_at: new Date().toISOString() };
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).upsert(mediaAssetToRow(restored), { onConflict: "id" });
  if (error) throw error;

  if (trashItem) await removeTrashItem(trashItem.id);
  await logAction({ action: "restore", entity_type: "media", entity_id: restored.id, entity_title: restored.original_name || restored.file_name });
  return restored;
}
export async function getMediaByFolder(folder: string) {
  const items = await getMediaAssets();
  return items.filter((a) => a.folder === folder && a.status !== "deleted");
}

export async function getMediaByType(fileType: string) {
  const items = await getMediaAssets();
  return items.filter((a) => a.file_type === fileType && a.status !== "deleted");
}
