import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isTestimonialStatus } from "./types";
import type { Testimonial, TestimonialStatus } from "./types";
import { logAction } from "./history-logs";

const TABLE = "testimonials";
const FILE_NAME = "testimonials.json";
type Input = Partial<Omit<Testimonial, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null; };

function normalize(input: Input, existing?: Testimonial) {
  const name = String(input.name ?? existing?.name ?? "").trim();
  const status = input.status ?? existing?.status ?? "draft";
  const now = new Date().toISOString();
  if (!name) throw new Error("El nombre es obligatorio.");
  if (!isTestimonialStatus(status)) throw new Error("Estado no válido.");
  return { id: existing?.id ?? input.id ?? randomUUID(), name, role: String(input.role ?? existing?.role ?? "").trim(), text: String(input.text ?? existing?.text ?? "").trim(), avatar_id: String(input.avatar_id ?? existing?.avatar_id ?? "").trim(), status, sort_order: input.sort_order ?? existing?.sort_order ?? 0, is_featured: input.is_featured !== undefined ? input.is_featured : (existing?.is_featured ?? false), created_at: existing?.created_at ?? now, updated_at: now, deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null } satisfies Testimonial;
}

// ── Mapping helpers ──

function rowToTestimonial(row: Record<string, unknown>): Testimonial {
  return row as unknown as Testimonial;
}

function testimonialToRow(t: Testimonial): Record<string, unknown> {
  return { ...t };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<Testimonial[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToTestimonial);
  } catch {
    return null;
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Testimonial | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToTestimonial(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertTestimonial(t: Testimonial): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(testimonialToRow(t), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function seedSupabase(items: Testimonial[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(items.map(testimonialToRow), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteTestimonialFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getTestimonials() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  const localTestimonials = await readJsonFile<Testimonial[]>(FILE_NAME, []);
  await seedSupabase(localTestimonials);
  return localTestimonials;
}

export async function getTestimonialById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const all = await readJsonFile<Testimonial[]>(FILE_NAME, []);
  const localTestimonial = all.find((x) => x.id === id) ?? null;
  if (localTestimonial) await seedSupabase([localTestimonial]);
  return localTestimonial;
}

export async function createTestimonial(data: Input) {
  const all = await getTestimonials();
  const next = normalize(data);
  await writeJsonFile(FILE_NAME, [next, ...all]);
  await upsertTestimonial(next);
  await logAction({ action: "create", entity_type: "testimonial", entity_id: next.id, entity_title: next.name, new_data: next });
  return next;
}

export async function updateTestimonial(id: string, data: Input) {
  const all = await getTestimonials();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const old = all[idx];
  const next = normalize(data, old);
  all[idx] = next;
  await writeJsonFile(FILE_NAME, all);
  await upsertTestimonial(next);
  if (old.status !== next.status) {
    if (next.status === "published") await logAction({ action: "publish", entity_type: "testimonial", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
    else if (old.status === "published") await logAction({ action: "unpublish", entity_type: "testimonial", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  }
  await logAction({ action: "update", entity_type: "testimonial", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  return next;
}

export async function reorderTestimonials(orderedIds: string[]) {
  const all = await getTestimonials();
  const now = new Date().toISOString();
  const byId = new Map(all.map((item) => [item.id, item]));
  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean) as Testimonial[];
  const orderedSet = new Set(ordered.map((item) => item.id));
  const rest = all
    .filter((item) => !orderedSet.has(item.id))
    .sort((a, b) => a.sort_order - b.sort_order || +new Date(b.updated_at) - +new Date(a.updated_at));
  let changed = false;
  const next = [...ordered, ...rest].map((item, index) => {
    if (item.sort_order === index) return item;
    changed = true;
    return { ...item, sort_order: index, updated_at: now };
  });

  if (!changed) return next;
  await writeJsonFile(FILE_NAME, next);
  await seedSupabase(next);
  await logAction({
    action: "update",
    entity_type: "testimonial",
    entity_id: "bulk-reorder",
    entity_title: "Orden de testimonios",
    new_data: { orderedIds },
  });
  return next;
}

export async function duplicateTestimonial(id: string) {
  const all = await getTestimonials();
  const orig = all.find((x) => x.id === id);
  if (!orig) return null;
  const copy = normalize({ ...orig, name: `${orig.name} (copia)`, status: "draft" });
  await writeJsonFile(FILE_NAME, [copy, ...all]);
  await upsertTestimonial(copy);
  await logAction({ action: "duplicate", entity_type: "testimonial", entity_id: orig.id, entity_title: orig.name, new_data: copy });
  return copy;
}

export async function moveTestimonialToTrash(id: string, deletedBy?: string) {
  const dBy = deletedBy ?? await getCurrentUserEmail();
  const all = await readJsonFile<Testimonial[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); if (idx === -1) return null;
  const d = new Date().toISOString(); const t: Testimonial = { ...all[idx], status: "deleted", deleted_at: d, updated_at: d };
  all[idx] = t; await writeJsonFile(FILE_NAME, all);
  await upsertTestimonial(t);
  await addTrashItem({ id: randomUUID(), entity_type: "testimonial", entity_id: id, title: t.name, deleted_by: dBy, deleted_at: d, restore_data: all[idx] }); await logAction({ action: "trash", entity_type: "testimonial", entity_id: id, entity_title: t.name, old_data: all[idx], user_email: dBy }); return t;
}

export async function restoreTestimonial(id: string) {
  const all = await readJsonFile<Testimonial[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); const ti = await getTrashItemByEntity(id);
  if (idx === -1 && !ti) return null;
  const r = ti?.restore_data && typeof ti.restore_data === "object" ? { ...(ti.restore_data as Testimonial), status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() } : { ...all[idx], status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() };
  if (idx === -1) { const a = await readJsonFile<Testimonial[]>(FILE_NAME, []); a.unshift(r); await writeJsonFile(FILE_NAME, a); }
  else { all[idx] = r; await writeJsonFile(FILE_NAME, all); }
  await upsertTestimonial(r);
  if (ti) await removeTrashItem(ti.id); await logAction({ action: "restore", entity_type: "testimonial", entity_id: r.id, entity_title: r.name }); return r;
}

export async function deleteTestimonialPermanently(id: string) {
  const all = await readJsonFile<Testimonial[]>(FILE_NAME, []); const item = all.find((x) => x.id === id); const next = all.filter((x) => x.id !== id); if (next.length === all.length) return false;
  await writeJsonFile(FILE_NAME, next); await deleteTestimonialFromDb(id); const ti = await getTrashItemByEntity(id); if (ti) await removeTrashItem(ti.id); if (item) await logAction({ action: "delete_permanently", entity_type: "testimonial", entity_id: id, entity_title: item.name, old_data: item }); return true;
}
