import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "../supabase/admin";
import { defaultHeroSettings, normalizeHeroSettings } from "./hero-settings";
import type { StudioPageSettings } from "./types";

const TABLE = "studio_page_settings";
const FILE_PATH = path.join(process.cwd(), "data", "studio-page-settings.json");
const SETTINGS_ID = "studio-page";

export const defaultStudioPageSettings: StudioPageSettings = {
  id: SETTINGS_ID,
  status: "published",
  hero: normalizeHeroSettings({
    ...defaultHeroSettings,
    heroVariant: "presentation",
    heroTitle: "El Estudio",
    heroSubtitle: "Casa Rosier",
    heroImage: "/img/hero-bg.jpg",
    heroPresentationText: "# El Estudio\n\nUn espacio para aprender ceramica con calma, explorar tecnicas y tocar la materia.",
  }),
  introContent: "Somos lo que somos y aqui estamos.\n\nEn Barcelona, un espacio para aprender ceramica con calma, explorar tecnicas, tocar la materia y encontrar una practica guiada que acompana cada primer gesto.",
  showIdeaPromptSection: true,
  showFaqSection: false,
  faqGroupId: "",
  seo_title: "El Estudio | Casa Rosier",
  seo_description: "Conoce el estudio, sus especialistas y la forma de trabajar la ceramica en Casa Rosier.",
  seo_image: "",
  updated_at: "",
};

function normalizeStudioPageSettings(input: Partial<StudioPageSettings> | null | undefined): StudioPageSettings {
  const rowInput = input as Partial<StudioPageSettings> & {
    intro_content?: string;
    show_idea_prompt_section?: boolean;
    show_faq_section?: boolean;
    faq_group_id?: string | null;
    faq_category?: string;
  } | null | undefined;

  return {
    ...defaultStudioPageSettings,
    ...input,
    id: SETTINGS_ID,
    status: input?.status === "draft" ? "draft" : "published",
    hero: normalizeHeroSettings(input?.hero, {
      heroTitle: "El Estudio",
      heroSubtitle: "Casa Rosier",
      heroImage: "/img/hero-bg.jpg",
    }),
    introContent: String(input?.introContent ?? rowInput?.intro_content ?? defaultStudioPageSettings.introContent),
    showIdeaPromptSection: (input?.showIdeaPromptSection ?? rowInput?.show_idea_prompt_section) !== false,
    showFaqSection: (input?.showFaqSection ?? rowInput?.show_faq_section) === true,
    faqGroupId: String(input?.faqGroupId ?? rowInput?.faq_group_id ?? ""),
    seo_title: String(input?.seo_title ?? defaultStudioPageSettings.seo_title),
    seo_description: String(input?.seo_description ?? defaultStudioPageSettings.seo_description),
    seo_image: String(input?.seo_image ?? ""),
    updated_at: String(input?.updated_at ?? ""),
  };
}

function toRow(settings: StudioPageSettings) {
  return {
    id: settings.id,
    status: settings.status,
    hero: settings.hero,
    intro_content: settings.introContent,
    show_idea_prompt_section: settings.showIdeaPromptSection,
    show_faq_section: settings.showFaqSection,
    faq_group_id: settings.faqGroupId || null,
    seo_title: settings.seo_title,
    seo_description: settings.seo_description,
    seo_image: settings.seo_image,
    updated_at: settings.updated_at,
  };
}

async function readFromFile() {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return normalizeStudioPageSettings(JSON.parse(raw) as Partial<StudioPageSettings>);
  } catch {
    return defaultStudioPageSettings;
  }
}

async function writeToFile(settings: StudioPageSettings) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
}

export async function getStudioPageSettings() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", SETTINGS_ID).maybeSingle();
    if (error) throw error;
    if (data) return normalizeStudioPageSettings(data as Partial<StudioPageSettings>);
  } catch {
    return readFromFile();
  }

  return readFromFile();
}

export async function updateStudioPageSettings(input: Partial<StudioPageSettings>) {
  const next = normalizeStudioPageSettings({
    ...input,
    updated_at: new Date().toISOString(),
  });

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).upsert(toRow(next), { onConflict: "id" });
    if (error) throw error;
  } catch {
    await writeToFile(next);
  }

  return next;
}
