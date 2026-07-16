import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { logAction } from "./history-logs";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { invalidatePublicRedirectCache } from "./public-redirects";
import { assertNoActiveRedirectLoop, normalizeRedirectSource, normalizeRedirectTarget } from "./redirect-routing";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { isRedirectStatus, isRedirectType } from "./types";
import type { Redirect } from "./types";

const TABLE = "redirects";
const FILE_NAME = "redirects.json";
type RedirectInput = Partial<Omit<Redirect, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null };

function normalize(input: RedirectInput, existing?: Redirect) {
  const now = new Date().toISOString();
  const source = normalizeRedirectSource(String(input.source_url ?? existing?.source_url ?? ""));
  const target = normalizeRedirectTarget(String(input.target_url ?? existing?.target_url ?? ""));
  const type = input.redirect_type ?? existing?.redirect_type ?? "301";
  const status = input.status ?? existing?.status ?? "active";
  if (source === target) throw new Error("La URL de origen y destino no pueden ser iguales.");
  if (!isRedirectType(type)) throw new Error("Tipo de redirección no válido.");
  if (!isRedirectStatus(status)) throw new Error("Estado no válido.");
  return {
    id: existing?.id ?? input.id ?? randomUUID(), source_url: source, target_url: target, redirect_type: type, status,
    notes: String(input.notes ?? existing?.notes ?? "").trim(),
    hit_count: input.hit_count ?? existing?.hit_count ?? 0,
    last_hit_at: input.last_hit_at !== undefined ? input.last_hit_at : (existing?.last_hit_at ?? null),
    created_at: existing?.created_at ?? now, updated_at: now,
    deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null,
  } satisfies Redirect;
}

function rowToRedirect(row: Record<string, unknown>): Redirect { return row as unknown as Redirect; }
function redirectToRow(redirect: Redirect): Record<string, unknown> { return { ...redirect }; }

async function readAllFromSupabase(): Promise<Redirect[] | null> {
  try {
    const { data, error } = await createAdminClient().from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToRedirect);
  } catch { return null; }
}

async function readFromSupabase(query: (client: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Redirect | null> {
  try {
    const row = await query(createAdminClient());
    return row ? rowToRedirect(row) : null;
  } catch { return null; }
}

async function upsertRedirect(redirect: Redirect) {
  try { await createAdminClient().from(TABLE).upsert(redirectToRow(redirect), { onConflict: "id" }); }
  catch { /* El archivo local mantiene el CMS operativo si Supabase no responde. */ }
}

async function deleteRedirectFromDb(id: string) {
  try { await createAdminClient().from(TABLE).delete().eq("id", id); }
  catch { /* Eliminación local de respaldo. */ }
}

export async function getRedirects() {
  const fromSupabase = await readAllFromSupabase();
  return fromSupabase ?? readJsonFile<Redirect[]>(FILE_NAME, []);
}

export async function getRedirectById(id: string) {
  const result = await readFromSupabase(async (client) => {
    const { data } = await client.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  return items.find((redirect) => redirect.id === id) ?? null;
}

export async function createRedirect(data: RedirectInput) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const next = normalize(data);
  assertNoActiveRedirectLoop(next, await getRedirects());
  await writeJsonFile(FILE_NAME, [next, ...items]);
  await upsertRedirect(next);
  invalidatePublicRedirectCache();
  await logAction({ action: "create", entity_type: "redirect", entity_id: next.id, entity_title: `${next.source_url} → ${next.target_url}`, new_data: next });
  return next;
}

export async function updateRedirect(id: string, data: RedirectInput) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const index = items.findIndex((redirect) => redirect.id === id);
  const old = index === -1 ? await getRedirectById(id) : items[index];
  if (!old) return null;
  const next = normalize(data, old);
  assertNoActiveRedirectLoop(next, await getRedirects());
  if (index === -1) items.unshift(next); else items[index] = next;
  await writeJsonFile(FILE_NAME, items);
  await upsertRedirect(next);
  invalidatePublicRedirectCache();
  await logAction({ action: "update", entity_type: "redirect", entity_id: next.id, entity_title: `${next.source_url} → ${next.target_url}`, old_data: old, new_data: next });
  return next;
}

export async function moveRedirectToTrash(id: string, deletedBy?: string) {
  const resolvedBy = deletedBy ?? await getCurrentUserEmail();
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const index = items.findIndex((redirect) => redirect.id === id);
  const current = index === -1 ? await getRedirectById(id) : items[index];
  if (!current) return null;
  const deletedAt = new Date().toISOString();
  const trashed: Redirect = { ...current, status: "deleted", deleted_at: deletedAt, updated_at: deletedAt };
  if (index === -1) items.unshift(trashed); else items[index] = trashed;
  await writeJsonFile(FILE_NAME, items);
  await upsertRedirect(trashed);
  invalidatePublicRedirectCache();
  await addTrashItem({ id: randomUUID(), entity_type: "redirect", entity_id: current.id, title: `${current.source_url} → ${current.target_url}`, deleted_by: resolvedBy, deleted_at: deletedAt, restore_data: current });
  await logAction({ action: "trash", entity_type: "redirect", entity_id: current.id, entity_title: `${current.source_url} → ${current.target_url}`, old_data: current, user_email: resolvedBy });
  return trashed;
}

export async function restoreRedirect(id: string) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const index = items.findIndex((redirect) => redirect.id === id);
  const trashItem = await getTrashItemByEntity(id);
  if (index === -1 && !trashItem) return null;
  const restored = trashItem?.restore_data && typeof trashItem.restore_data === "object"
    ? ({ ...(trashItem.restore_data as Redirect), status: "inactive", deleted_at: null, updated_at: new Date().toISOString() } as Redirect)
    : ({ ...items[index], status: "inactive", deleted_at: null, updated_at: new Date().toISOString() } as Redirect);
  if (index === -1) { items.unshift(restored); } else { items[index] = restored; }
  await writeJsonFile(FILE_NAME, items);
  await upsertRedirect(restored);
  invalidatePublicRedirectCache();
  if (trashItem) await removeTrashItem(trashItem.id);
  await logAction({ action: "restore", entity_type: "redirect", entity_id: restored.id, entity_title: `${restored.source_url} → ${restored.target_url}` });
  return restored;
}

export async function deleteRedirectPermanently(id: string) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const item = items.find((redirect) => redirect.id === id) ?? await getRedirectById(id);
  const next = items.filter((redirect) => redirect.id !== id);
  if (next.length === items.length && !item) return false;
  await writeJsonFile(FILE_NAME, next);
  await deleteRedirectFromDb(id);
  invalidatePublicRedirectCache();
  const trashItem = await getTrashItemByEntity(id);
  if (trashItem) await removeTrashItem(trashItem.id);
  if (item) await logAction({ action: "delete_permanently", entity_type: "redirect", entity_id: id, entity_title: `${item.source_url} → ${item.target_url}`, old_data: item });
  return true;
}
