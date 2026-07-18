import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "../supabase/admin";
import { defaultHeroSettings, normalizeHeroSettings } from "./hero-settings";
import type { BlogPageSettings } from "./types";

const TABLE = "blog_page_settings";
const FILE_PATH = path.join(process.cwd(), "data", "blog-page-settings.json");
const SETTINGS_ID = "blog-page";

export const defaultBlogPageSettings: BlogPageSettings = {
  id: SETTINGS_ID,
  status: "published",
  hero: normalizeHeroSettings({
    ...defaultHeroSettings,
    heroVariant: "text",
    heroTitle: "Bitacora ceramica",
    heroSubtitle: "Casa Rosier",
    heroImage: "/img/hero-bg.jpg",
    heroPresentationText: "# Bitacora ceramica\n\nProcesos, tecnicas y reflexiones alrededor de la ceramica contemporanea.",
  }),
  showIdeaPromptSection: true,
  showFaqSection: false,
  faqGroupId: "",
  seo_title: "Blog | Casa Rosier Ceramica",
  seo_description: "Articulos, procesos y reflexiones sobre ceramica, talleres, tecnicas y creacion en Casa Rosier Ceramica Barcelona.",
  seo_image: "",
  updated_at: "",
};

function normalizeBlogPageSettings(input: Partial<BlogPageSettings> | null | undefined): BlogPageSettings {
  const rowInput = input as Partial<BlogPageSettings> & {
    show_idea_prompt_section?: boolean;
    show_faq_section?: boolean;
    faq_group_id?: string | null;
    faq_category?: string;
  } | null | undefined;

  return {
    ...defaultBlogPageSettings,
    ...input,
    id: SETTINGS_ID,
    status: input?.status === "draft" ? "draft" : "published",
    hero: normalizeHeroSettings(input?.hero, {
      heroTitle: "Bitacora ceramica",
      heroSubtitle: "Casa Rosier",
      heroImage: "/img/hero-bg.jpg",
    }),
    showIdeaPromptSection: (input?.showIdeaPromptSection ?? rowInput?.show_idea_prompt_section) !== false,
    showFaqSection: (input?.showFaqSection ?? rowInput?.show_faq_section) === true,
    faqGroupId: String(input?.faqGroupId ?? rowInput?.faq_group_id ?? ""),
    seo_title: String(input?.seo_title ?? defaultBlogPageSettings.seo_title),
    seo_description: String(input?.seo_description ?? defaultBlogPageSettings.seo_description),
    seo_image: String(input?.seo_image ?? ""),
    updated_at: String(input?.updated_at ?? ""),
  };
}

function toRow(settings: BlogPageSettings) {
  return {
    id: settings.id,
    status: settings.status,
    hero: settings.hero,
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
    return normalizeBlogPageSettings(JSON.parse(raw) as Partial<BlogPageSettings>);
  } catch {
    return defaultBlogPageSettings;
  }
}

async function writeToFile(settings: BlogPageSettings) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
}

export async function getBlogPageSettings() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", SETTINGS_ID).maybeSingle();
    if (error) throw error;
    if (data) return normalizeBlogPageSettings(data as Partial<BlogPageSettings>);
  } catch {
    return readFromFile();
  }

  return readFromFile();
}

export async function updateBlogPageSettings(input: Partial<BlogPageSettings>) {
  const next = normalizeBlogPageSettings({
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
