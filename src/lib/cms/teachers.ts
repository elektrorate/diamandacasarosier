import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { addTrashItem, getCurrentUserEmail, getTrashItemByEntity, removeTrashItem } from "./trash";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { isTeacherStatus } from "./types";
import type { Teacher, TeacherStatus } from "./types";
import { logAction } from "./history-logs";

const TABLE = "teachers";
const FILE_NAME = "teachers.json";
type Input = Partial<Omit<Teacher, "id" | "created_at" | "updated_at" | "deleted_at">> & { id?: string; deleted_at?: string | null; };

function normalize(input: Input, existing?: Teacher) {
  const name = String(input.name ?? existing?.name ?? "").trim();
  const status = input.status ?? existing?.status ?? "draft";
  const now = new Date().toISOString();
  if (!name) throw new Error("El nombre es obligatorio.");
  if (!isTeacherStatus(status)) throw new Error("Estado no válido.");
  return { id: existing?.id ?? input.id ?? randomUUID(), name, bio: String(input.bio ?? existing?.bio ?? "").trim(), image_id: String(input.image_id ?? existing?.image_id ?? "").trim(), instagram: String(input.instagram ?? existing?.instagram ?? "").trim(), specialty: String(input.specialty ?? existing?.specialty ?? "").trim(), status, sort_order: input.sort_order ?? existing?.sort_order ?? 0, created_at: existing?.created_at ?? now, updated_at: now, deleted_at: input.status === "deleted" ? existing?.deleted_at ?? now : null } satisfies Teacher;
}

// ── Mapping helpers ──

function rowToTeacher(row: Record<string, unknown>): Teacher {
  return row as unknown as Teacher;
}

function teacherToRow(t: Teacher): Record<string, unknown> {
  return { ...t };
}

// ── Supabase helpers ──

async function readAllFromSupabase(): Promise<Teacher[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return (data as Array<Record<string, unknown>>).map(rowToTeacher);
  } catch {
    return null;
  }
}

async function readFromSupabase(query: (s: ReturnType<typeof createAdminClient>) => Promise<Record<string, unknown> | null>): Promise<Teacher | null> {
  try {
    const supabase = createAdminClient();
    const row = await query(supabase);
    if (!row) return null;
    return rowToTeacher(row);
  } catch { /* fall through */ }
  return null;
}

async function upsertTeacher(t: Teacher): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).upsert(teacherToRow(t), { onConflict: "id" });
  } catch { /* best-effort */ }
}

async function deleteTeacherFromDb(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from(TABLE).delete().eq("id", id);
  } catch { /* best-effort */ }
}

// ── Public API ──

export async function getTeachers() {
  const fromSupabase = await readAllFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readJsonFile<Teacher[]>(FILE_NAME, []);
}

export async function getTeacherById(id: string) {
  const result = await readFromSupabase(async (supabase) => {
    const { data } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    return data as Record<string, unknown> | null;
  });
  if (result) return result;
  const all = await readJsonFile<Teacher[]>(FILE_NAME, []);
  return all.find((x) => x.id === id) ?? null;
}

export async function createTeacher(data: Input) {
  const all = await getTeachers();
  const next = normalize(data);
  await writeJsonFile(FILE_NAME, [next, ...all]);
  await upsertTeacher(next);
  await logAction({ action: "create", entity_type: "teacher", entity_id: next.id, entity_title: next.name, new_data: next });
  return next;
}

export async function updateTeacher(id: string, data: Input) {
  const all = await getTeachers();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const old = all[idx];
  const next = normalize(data, old);
  all[idx] = next;
  await writeJsonFile(FILE_NAME, all);
  await upsertTeacher(next);
  if (old.status !== next.status) {
    if (next.status === "published") await logAction({ action: "publish", entity_type: "teacher", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
    else if (old.status === "published") await logAction({ action: "unpublish", entity_type: "teacher", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  }
  await logAction({ action: "update", entity_type: "teacher", entity_id: next.id, entity_title: next.name, old_data: old, new_data: next });
  return next;
}

export async function duplicateTeacher(id: string) {
  const all = await getTeachers();
  const orig = all.find((x) => x.id === id);
  if (!orig) return null;
  const copy = normalize({ ...orig, name: `${orig.name} (copia)`, status: "draft" });
  await writeJsonFile(FILE_NAME, [copy, ...all]);
  await upsertTeacher(copy);
  await logAction({ action: "duplicate", entity_type: "teacher", entity_id: orig.id, entity_title: orig.name, new_data: copy });
  return copy;
}

export async function moveTeacherToTrash(id: string, deletedBy?: string) {
  const dBy = deletedBy ?? await getCurrentUserEmail();
  const all = await readJsonFile<Teacher[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); if (idx === -1) return null;
  const d = new Date().toISOString(); const t: Teacher = { ...all[idx], status: "deleted", deleted_at: d, updated_at: d };
  all[idx] = t; await writeJsonFile(FILE_NAME, all);
  await upsertTeacher(t);
  await addTrashItem({ id: randomUUID(), entity_type: "teacher", entity_id: id, title: t.name, deleted_by: dBy, deleted_at: d, restore_data: all[idx] }); await logAction({ action: "trash", entity_type: "teacher", entity_id: id, entity_title: t.name, old_data: all[idx], user_email: dBy }); return t;
}

export async function restoreTeacher(id: string) {
  const all = await readJsonFile<Teacher[]>(FILE_NAME, []); const idx = all.findIndex((x) => x.id === id); const ti = await getTrashItemByEntity(id);
  if (idx === -1 && !ti) return null;
  const r = ti?.restore_data && typeof ti.restore_data === "object" ? { ...(ti.restore_data as Teacher), status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() } : { ...all[idx], status: "draft" as const, deleted_at: null, updated_at: new Date().toISOString() };
  if (idx === -1) { const a = await readJsonFile<Teacher[]>(FILE_NAME, []); a.unshift(r); await writeJsonFile(FILE_NAME, a); }
  else { all[idx] = r; await writeJsonFile(FILE_NAME, all); }
  await upsertTeacher(r);
  if (ti) await removeTrashItem(ti.id); await logAction({ action: "restore", entity_type: "teacher", entity_id: r.id, entity_title: r.name }); return r;
}

export async function deleteTeacherPermanently(id: string) {
  const all = await readJsonFile<Teacher[]>(FILE_NAME, []); const item = all.find((x) => x.id === id); const next = all.filter((x) => x.id !== id); if (next.length === all.length) return false;
  await writeJsonFile(FILE_NAME, next); await deleteTeacherFromDb(id); const ti = await getTrashItemByEntity(id); if (ti) await removeTrashItem(ti.id); if (item) await logAction({ action: "delete_permanently", entity_type: "teacher", entity_id: id, entity_title: item.name, old_data: item }); return true;
}
