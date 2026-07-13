import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isFaqStatus, FAQ_CATEGORIES } from "./types";
import type { Faq, FaqStatus } from "./types";
import { logAction } from "./history-logs";

const TABLE = "faqs";
const FILE_NAME = "faqs.json";
type Input = Partial<Omit<Faq, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null; };

function normalize(input: Input, existing?: Faq) {
  const question = String(input.question ?? existing?.question ?? "").trim();
  const status = input.status ?? existing?.status ?? "draft";
  const now = new Date().toISOString();
  if (!question) throw new Error("La pregunta es obligatoria.");
  if (!isFaqStatus(status)) throw new Error("Estado no válido.");
  const cat = input.category ?? existing?.category ?? "general";
  return { id: existing?.id ?? input.id ?? randomUUID(), question, answer: String(input.answer ?? existing?.answer ?? "").trim(), category: FAQ_CATEGORIES.includes(cat as never) ? cat : "general", sort_order: input.sort_order ?? existing?.sort_order ?? 0, status, created_at: existing?.created_at ?? now, updated_at: now, deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null } satisfies Faq;
}

// ── Mapping helpers ──

function rowToFaq(row: Record<string, unknown>): Faq {
  return row as unknown as Faq;
}

function faqToRow(f: Faq): Record<string, unknown> {
  return { ...f };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<Faq[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToFaq);
  } catch {
    return null;
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Faq | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToFaq(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertFaq(f: Faq): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(faqToRow(f), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteFaqFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getFaqs() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readJsonFile<Faq[]>(FILE_NAME, []);
}

export async function getFaqById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const all = await readJsonFile<Faq[]>(FILE_NAME, []);
  return all.find((x) => x.id === id) ?? null;
}

export async function createFaq(data: Input) {
  const all = await getFaqs();
  const next = normalize(data);
  await writeJsonFile(FILE_NAME, [next, ...all]);
  await upsertFaq(next);
  await logAction({ action: "create", entity_type: "faq", entity_id: next.id, entity_title: next.question, new_data: next });
  return next;
}

export async function updateFaq(id: string, data: Input) {
  const all = await getFaqs();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const old = all[idx];
  const next = normalize(data, old);
  all[idx] = next;
  await writeJsonFile(FILE_NAME, all);
  await upsertFaq(next);
  if (old.status !== next.status) {
    if (next.status === "published") await logAction({ action: "publish", entity_type: "faq", entity_id: next.id, entity_title: next.question, old_data: old, new_data: next });
    else if (old.status === "published") await logAction({ action: "unpublish", entity_type: "faq", entity_id: next.id, entity_title: next.question, old_data: old, new_data: next });
  }
  await logAction({ action: "update", entity_type: "faq", entity_id: next.id, entity_title: next.question, old_data: old, new_data: next });
  return next;
}

export async function duplicateFaq(id: string) {
  const all = await getFaqs();
  const orig = all.find((x) => x.id === id);
  if (!orig) return null;
  const copy = normalize({ ...orig, question: `${orig.question} (copia)`, status: "draft" });
  await writeJsonFile(FILE_NAME, [copy, ...all]);
  await upsertFaq(copy);
  await logAction({ action: "duplicate", entity_type: "faq", entity_id: orig.id, entity_title: orig.question, new_data: copy });
  return copy;
}

export async function moveFaqToTrash(id: string, deletedBy?: string) {
  const dBy = deletedBy ?? await getCurrentUserEmail();
  const all = await readJsonFile<Faq[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); if (idx === -1) return null;
  const d = new Date().toISOString(); const t: Faq = { ...all[idx], status: "deleted", deleted_at: d, updated_at: d };
  all[idx] = t; await writeJsonFile(FILE_NAME, all);
  await upsertFaq(t);
  await addTrashItem({ id: randomUUID(), entity_type: "faq", entity_id: id, title: t.question, deleted_by: dBy, deleted_at: d, restore_data: all[idx] }); await logAction({ action: "trash", entity_type: "faq", entity_id: id, entity_title: t.question, old_data: all[idx], user_email: dBy }); return t;
}

export async function restoreFaq(id: string) {
  const all = await readJsonFile<Faq[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); const ti = await getTrashItemByEntity(id);
  if (idx === -1 && !ti) return null;
  const r = ti?.restore_data && typeof ti.restore_data === "object" ? { ...(ti.restore_data as Faq), status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() } : { ...all[idx], status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() };
  if (idx === -1) { const a = await readJsonFile<Faq[]>(FILE_NAME, []); a.unshift(r); await writeJsonFile(FILE_NAME, a); }
  else { all[idx] = r; await writeJsonFile(FILE_NAME, all); }
  await upsertFaq(r);
  if (ti) await removeTrashItem(ti.id); await logAction({ action: "restore", entity_type: "faq", entity_id: r.id, entity_title: r.question }); return r;
}

export async function deleteFaqPermanently(id: string) {
  const all = await readJsonFile<Faq[]>(FILE_NAME, []); const item = all.find((x) => x.id === id); const next = all.filter((x) => x.id !== id); if (next.length === all.length) return false;
  await writeJsonFile(FILE_NAME, next); await deleteFaqFromDb(id); const ti = await getTrashItemByEntity(id); if (ti) await removeTrashItem(ti.id); if (item) await logAction({ action: "delete_permanently", entity_type: "faq", entity_id: id, entity_title: item.question, old_data: item }); return true;
}
