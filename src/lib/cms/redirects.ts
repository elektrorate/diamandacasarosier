import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isRedirectStatus, isRedirectType } from "./types";
import type { Redirect } from "./types";
import { logAction } from "./history-logs";

const TABLE = "redirects";
const FILE_NAME = "redirects.json";

type RedirectInput = Partial<Omit<Redirect, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null };

function normalize(input: RedirectInput, existing?: Redirect) {
  const now = new Date().toISOString();
  const source = String(input.source_url ?? existing?.source_url ?? "").trim();
  const target = String(input.target_url ?? existing?.target_url ?? "").trim();
  const type = input.redirect_type ?? existing?.redirect_type ?? "301";
  const status = input.status ?? existing?.status ?? "active";
  if (!source) throw new Error("La URL de origen es obligatoria.");
  if (!target) throw new Error("La URL de destino es obligatoria.");
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

// ── Mapping helpers ──

function rowToRedirect(row: Record<string, unknown>): Redirect {
  return row as unknown as Redirect;
}

function redirectToRow(r: Redirect): Record<string, unknown> {
  return { ...r };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<Redirect[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToRedirect);
  } catch {
    return null;
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Redirect | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToRedirect(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertRedirect(r: Redirect): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(redirectToRow(r), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteRedirectFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getRedirects() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readJsonFile<Redirect[]>(FILE_NAME, []);
}

export async function getRedirectById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  return items.find((r) => r.id === id) ?? null;
}

export async function createRedirect(data: RedirectInput) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const next = normalize(data);
  await writeJsonFile(FILE_NAME, [next, ...items]);
  await upsertRedirect(next);
  await logAction({ action: "create", entity_type: "redirect", entity_id: next.id, entity_title: `${next.source_url} → ${next.target_url}`, new_data: next });
  return next;
}

export async function updateRedirect(id: string, data: RedirectInput) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const idx = items.findIndex((r) => r.id === id);
  const old = idx === -1 ? await getRedirectById(id) : items[idx];
  if (!old) return null;
  const next = normalize(data, old);
  if (idx === -1) items.unshift(next);
  else items[idx] = next;
  await writeJsonFile(FILE_NAME, items);
  await upsertRedirect(next);
  await logAction({ action: "update", entity_type: "redirect", entity_id: next.id, entity_title: `${next.source_url} → ${next.target_url}`, old_data: old, new_data: next });
  return next;
}

export async function moveRedirectToTrash(id: string, dBy?: string) {
  const resolvedBy = dBy ?? await getCurrentUserEmail();
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const idx = items.findIndex((r) => r.id === id);
  const c = idx === -1 ? await getRedirectById(id) : items[idx];
  if (!c) return null;
  const d = new Date().toISOString();
  const t: Redirect = { ...c, status: "deleted", deleted_at: d, updated_at: d };
  if (idx === -1) items.unshift(t);
  else items[idx] = t;
  await writeJsonFile(FILE_NAME, items);
  await upsertRedirect(t);
  await addTrashItem({ id: randomUUID(), entity_type: "redirect", entity_id: c.id, title: `${c.source_url} → ${c.target_url}`, deleted_by: resolvedBy, deleted_at: d, restore_data: c });
  await logAction({ action: "trash", entity_type: "redirect", entity_id: c.id, entity_title: `${c.source_url} → ${c.target_url}`, old_data: c, user_email: resolvedBy });
  return t;
}

export async function restoreRedirect(id: string) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const idx = items.findIndex((r) => r.id === id);
  const t = await getTrashItemByEntity(id);
  if (idx === -1 && !t) return null;
  const r = t?.restore_data && typeof t.restore_data === "object"
    ? ({ ...(t.restore_data as Redirect), status: "inactive", deleted_at: null, updated_at: new Date().toISOString() } as Redirect)
    : ({ ...items[idx], status: "inactive", deleted_at: null, updated_at: new Date().toISOString() } as Redirect);
  if (idx === -1) { const a = await readJsonFile<Redirect[]>(FILE_NAME, []); a.unshift(r); await writeJsonFile(FILE_NAME, a); }
  else { items[idx] = r; await writeJsonFile(FILE_NAME, items); }
  await upsertRedirect(r);
  if (t) await removeTrashItem(t.id);
  await logAction({ action: "restore", entity_type: "redirect", entity_id: r.id, entity_title: `${r.source_url} → ${r.target_url}` });
  return r;
}

export async function deleteRedirectPermanently(id: string) {
  const items = await readJsonFile<Redirect[]>(FILE_NAME, []);
  const item = items.find((r) => r.id === id) ?? await getRedirectById(id);
  const next = items.filter((r) => r.id !== id);
  if (next.length === items.length && !item) return false;
  await writeJsonFile(FILE_NAME, next);
  await deleteRedirectFromDb(id);
  const t = await getTrashItemByEntity(id);
  if (t) await removeTrashItem(t.id);
  if (item) await logAction({ action: "delete_permanently", entity_type: "redirect", entity_id: id, entity_title: `${item.source_url} → ${item.target_url}`, old_data: item });
  return true;
}
