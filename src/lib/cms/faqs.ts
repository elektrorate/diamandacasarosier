import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isFaqStatus, FAQ_CATEGORIES } from "./types";
import type { Faq, FaqGroup, FaqStatus, PublicFaqBlock } from "./types";
import { logAction } from "./history-logs";

const TABLE = "faqs";
const GROUPS_TABLE = "faq_groups";
const FILE_NAME = "faqs.json";
const GROUPS_FILE_NAME = "faq-groups.json";

type Input = Partial<Omit<Faq, "id" | "created_at" | "updated_at" | "deleted_at">> & {
  id?: string;
  deleted_at?: string | null;
  faq_group_title?: string;
  faq_group_description?: string;
};

type GroupInput = Partial<Omit<FaqGroup, "id" | "created_at" | "updated_at" | "deleted_at">> & {
  id?: string;
  deleted_at?: string | null;
};

function normalizeGroup(input: GroupInput, existing?: FaqGroup): FaqGroup {
  const title = String(input.title ?? existing?.title ?? "").trim();
  const now = new Date().toISOString();
  if (!title) throw new Error("El titulo del grupo FAQ es obligatorio.");
  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    title,
    description: String(input.description ?? existing?.description ?? "").trim(),
    status: isFaqStatus(input.status ?? existing?.status) ? (input.status ?? existing?.status ?? "draft") as FaqStatus : "draft",
    sort_order: Number(input.sort_order ?? existing?.sort_order ?? 0),
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: input.deleted_at ?? existing?.deleted_at ?? null,
  };
}

function normalize(input: Input, existing?: Faq) {
  const question = String(input.question ?? existing?.question ?? "").trim();
  const status = input.status ?? existing?.status ?? "draft";
  const now = new Date().toISOString();
  if (!question) throw new Error("La pregunta es obligatoria.");
  if (!isFaqStatus(status)) throw new Error("Estado no valido.");
  const cat = input.category ?? existing?.category ?? "general";
  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    question,
    answer: String(input.answer ?? existing?.answer ?? "").trim(),
    category: FAQ_CATEGORIES.includes(cat as never) ? cat : "general",
    faq_group_id: input.faq_group_id ?? existing?.faq_group_id ?? null,
    topic_title: String(input.topic_title ?? existing?.topic_title ?? "General").trim() || "General",
    sort_order: Number(input.sort_order ?? existing?.sort_order ?? 0),
    status,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : input.deleted_at ?? null,
  } satisfies Faq;
}

function rowToFaq(row: Record<string, unknown>): Faq {
  return {
    ...(row as unknown as Faq),
    faq_group_id: typeof row.faq_group_id === "string" ? row.faq_group_id : null,
    topic_title: typeof row.topic_title === "string" && row.topic_title.trim() ? row.topic_title : "General",
  };
}

function rowToGroup(row: Record<string, unknown>): FaqGroup {
  return row as unknown as FaqGroup;
}

async function readGroupsFromSupabase(): Promise<FaqGroup[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(GROUPS_TABLE).select("*").order("sort_order").order("title");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToGroup);
  } catch {
    return null;
  }
}

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

async function upsertGroup(group: FaqGroup): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(GROUPS_TABLE).upsert(group, { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function upsertFaq(faq: Faq): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(faq, { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteFaqFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

async function ensureGroupForInput(input: Input, existing?: Faq): Promise<string | null> {
  if (input.faq_group_id !== undefined) return input.faq_group_id || null;
  if (existing?.faq_group_id) return existing.faq_group_id;

  const title = String(input.faq_group_title ?? "").trim();
  if (!title) return null;
  const groups = await getFaqGroups();
  const found = groups.find((group) => group.title.toLowerCase() === title.toLowerCase() && group.deleted_at === null);
  if (found) return found.id;

  const next = normalizeGroup({
    title,
    description: input.faq_group_description ?? "",
    status: "published",
    sort_order: groups.length,
  });
  await writeJsonFile(GROUPS_FILE_NAME, [next, ...groups]);
  await upsertGroup(next);
  await logAction({ action: "create", entity_type: "faq_group", entity_id: next.id, entity_title: next.title, new_data: next });
  return next.id;
}

export async function getFaqGroups() {
  const fromSupabase = await readGroupsFromSupabase();
  if (fromSupabase) return fromSupabase;
  const groups = await readJsonFile<FaqGroup[]>(GROUPS_FILE_NAME, []);
  if (groups.length) return groups;
  return [];
}

export async function getPublishedFaqGroups() {
  const groups = await getFaqGroups();
  return groups
    .filter((group) => group.status === "published" && group.deleted_at === null)
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}

export async function getFaqs() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readJsonFile<Faq[]>(FILE_NAME, []);
}

export async function getPublishedFaqsByGroup(groupId: string) {
  const items = await getFaqs();
  return items
    .filter((item) => item.status === "published" && item.deleted_at === null && item.faq_group_id === groupId)
    .sort((a, b) => (a.topic_title || "").localeCompare(b.topic_title || "") || a.sort_order - b.sort_order || a.question.localeCompare(b.question));
}

export async function getPublishedFaqBlock(groupId: string | null | undefined): Promise<PublicFaqBlock | null> {
  if (!groupId) return null;
  const groups = await getPublishedFaqGroups();
  const group = groups.find((item) => item.id === groupId);
  if (!group) return null;
  const faqs = await getPublishedFaqsByGroup(group.id);
  if (!faqs.length) return null;
  return { group, faqs };
}

export async function getFaqById(id: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (data) return rowToFaq(data as Record<string, unknown>);
  } catch { /* fall through */ }
  const all = await readJsonFile<Faq[]>(FILE_NAME, []);
  const item = all.find((x) => x.id === id);
  return item ? normalize(item, item) : null;
}

export async function createFaq(data: Input) {
  const all = await getFaqs();
  const faq_group_id = await ensureGroupForInput(data);
  const next = normalize({ ...data, faq_group_id });
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
  const faq_group_id = await ensureGroupForInput(data, old);
  const next = normalize({ ...data, faq_group_id }, old);
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
  const copy = normalize({ ...orig, question: orig.question + " (copia)", status: "draft" });
  await writeJsonFile(FILE_NAME, [copy, ...all]);
  await upsertFaq(copy);
  await logAction({ action: "duplicate", entity_type: "faq", entity_id: orig.id, entity_title: orig.question, new_data: copy });
  return copy;
}

export async function moveFaqToTrash(id: string, deletedBy?: string) {
  const dBy = deletedBy ?? await getCurrentUserEmail();
  const all = await getFaqs();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const d = new Date().toISOString();
  const t: Faq = { ...all[idx], status: "deleted", deleted_at: d, updated_at: d };
  all[idx] = t;
  await writeJsonFile(FILE_NAME, all);
  await upsertFaq(t);
  await addTrashItem({ id: randomUUID(), entity_type: "faq", entity_id: id, title: t.question, deleted_by: dBy, deleted_at: d, restore_data: t });
  await logAction({ action: "trash", entity_type: "faq", entity_id: id, entity_title: t.question, old_data: all[idx], user_email: dBy });
  return t;
}

export async function restoreFaq(id: string) {
  const all = await getFaqs();
  const idx = all.findIndex((x) => x.id === id);
  const ti = await getTrashItemByEntity(id);
  if (idx === -1 && !ti) return null;
  const r = ti?.restore_data && typeof ti.restore_data === "object"
    ? { ...(ti.restore_data as Faq), status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() }
    : { ...all[idx], status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() };
  if (idx === -1) all.unshift(r);
  else all[idx] = r;
  await writeJsonFile(FILE_NAME, all);
  await upsertFaq(r);
  if (ti) await removeTrashItem(ti.id);
  await logAction({ action: "restore", entity_type: "faq", entity_id: r.id, entity_title: r.question });
  return r;
}

export async function deleteFaqPermanently(id: string) {
  const all = await readJsonFile<Faq[]>(FILE_NAME, []);
  const item = all.find((x) => x.id === id);
  const next = all.filter((x) => x.id !== id);
  if (next.length !== all.length) await writeJsonFile(FILE_NAME, next);
  await deleteFaqFromDb(id);
  const ti = await getTrashItemByEntity(id);
  if (ti) await removeTrashItem(ti.id);
  if (item) await logAction({ action: "delete_permanently", entity_type: "faq", entity_id: id, entity_title: item.question, old_data: item });
  return true;
}
