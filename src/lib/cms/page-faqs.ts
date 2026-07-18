import { randomUUID } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { getPageBySlug } from "./pages";
import type { PageFaqItem, PageFaqSection } from "./types";

const SECTIONS_TABLE = "page_faq_sections";
const ITEMS_TABLE = "page_faq_items";
const SECTIONS_FILE = "page-faq-sections.json";
const ITEMS_FILE = "page-faq-items.json";

type ItemInput = Partial<Omit<PageFaqItem, "created_at" | "updated_at">> & { id?: string };
type SectionInput = Partial<Omit<PageFaqSection, "created_at" | "updated_at" | "items">> & {
  id?: string;
  items?: ItemInput[];
};

function normalizeItem(input: ItemInput, sectionId: string, index: number, existing?: PageFaqItem): PageFaqItem {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    faq_section_id: sectionId,
    question: String(input.question ?? existing?.question ?? "").trim(),
    answer: String(input.answer ?? existing?.answer ?? "").trim(),
    position: Number(input.position ?? existing?.position ?? index),
    is_visible: input.is_visible ?? existing?.is_visible ?? true,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

function normalizeSection(pageId: string, input: SectionInput, existing?: PageFaqSection): PageFaqSection {
  const now = new Date().toISOString();
  const sectionId = existing?.id ?? input.id ?? randomUUID();
  const existingItems = new Map((existing?.items ?? []).map((item) => [item.id, item]));
  const items = (input.items ?? existing?.items ?? [])
    .map((item, index) => normalizeItem(item, sectionId, index, item.id ? existingItems.get(item.id) : undefined))
    .filter((item) => item.question || item.answer)
    .map((item, index) => ({ ...item, position: index }));

  return {
    id: sectionId,
    page_id: pageId,
    title: String(input.title ?? existing?.title ?? "Preguntas frecuentes").trim() || "Preguntas frecuentes",
    is_enabled: input.is_enabled ?? existing?.is_enabled ?? false,
    items,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

async function readSectionsFromSupabase(): Promise<PageFaqSection[] | null> {
  try {
    const supabase = createAdminClient();
    const [{ data: sections, error: sectionsError }, { data: items, error: itemsError }] = await Promise.all([
      supabase.from(SECTIONS_TABLE).select("*"),
      supabase.from(ITEMS_TABLE).select("*").order("position"),
    ]);
    if (sectionsError || itemsError) throw sectionsError ?? itemsError;
    if (!sections) return null;
    const itemsBySection = new Map<string, PageFaqItem[]>();
    for (const item of (items ?? []) as unknown as PageFaqItem[]) {
      const list = itemsBySection.get(item.faq_section_id) ?? [];
      list.push(item);
      itemsBySection.set(item.faq_section_id, list);
    }
    return (sections as unknown as Omit<PageFaqSection, "items">[]).map((section) => ({
      ...section,
      items: (itemsBySection.get(section.id) ?? []).sort((a, b) => a.position - b.position),
    }));
  } catch {
    return null;
  }
}

async function readLocalSections(): Promise<PageFaqSection[]> {
  const sections = await readJsonFile<Array<Omit<PageFaqSection, "items">>>(SECTIONS_FILE, []);
  const items = await readJsonFile<PageFaqItem[]>(ITEMS_FILE, []);
  return sections.map((section) => ({
    ...section,
    items: items.filter((item) => item.faq_section_id === section.id).sort((a, b) => a.position - b.position),
  }));
}

async function writeLocalSection(section: PageFaqSection) {
  const sections = await readJsonFile<Array<Omit<PageFaqSection, "items">>>(SECTIONS_FILE, []);
  const items = await readJsonFile<PageFaqItem[]>(ITEMS_FILE, []);
  const sectionRow = { ...section };
  delete (sectionRow as Partial<PageFaqSection>).items;
  const nextSections = [sectionRow as Omit<PageFaqSection, "items">, ...sections.filter((item) => item.id !== section.id && item.page_id !== section.page_id)];
  const nextItems = [...items.filter((item) => item.faq_section_id !== section.id), ...section.items];
  await writeJsonFile(SECTIONS_FILE, nextSections);
  await writeJsonFile(ITEMS_FILE, nextItems);
}

async function upsertToSupabase(section: PageFaqSection) {
  try {
    const supabase = createAdminClient();
    const sectionRow = { ...section };
    delete (sectionRow as Partial<PageFaqSection>).items;
    await supabase.from(SECTIONS_TABLE).upsert(sectionRow, { onConflict: "page_id" });
    await supabase.from(ITEMS_TABLE).delete().eq("faq_section_id", section.id);
    if (section.items.length) await supabase.from(ITEMS_TABLE).upsert(section.items, { onConflict: "id" });
  } catch {
    /* best-effort */
  }
}

export async function getPageFaqSections() {
  const fromSupabase = await readSectionsFromSupabase();
  if (fromSupabase) return fromSupabase;
  return readLocalSections();
}

export async function getPageFaqSection(pageId: string) {
  const sections = await getPageFaqSections();
  return sections.find((section) => section.page_id === pageId) ?? null;
}

export async function savePageFaqSection(pageId: string, input: SectionInput) {
  const existing = await getPageFaqSection(pageId);
  const section = normalizeSection(pageId, input, existing ?? undefined);
  await writeLocalSection(section);
  await upsertToSupabase(section);
  return section;
}

export async function getPublicPageFaqSectionBySlug(slug: string) {
  const page = await getPageBySlug(slug);
  if (!page || page.status !== "published" || page.deleted_at) return null;
  const section = await getPageFaqSection(page.id);
  if (!section?.is_enabled) return null;
  const items = section.items
    .filter((item) => item.is_visible && item.question.trim())
    .sort((a, b) => a.position - b.position);
  if (!items.length) return null;
  return { ...section, items };
}