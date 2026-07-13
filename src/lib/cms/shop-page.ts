import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "../supabase/admin";
import { defaultHeroSettings, normalizeHeroSettings } from "./hero-settings";
import type { ShopPageSettings } from "./types";

const TABLE = "shop_page_settings";
const FILE_PATH = path.join(process.cwd(), "data", "shop-page-settings.json");
const SETTINGS_ID = "shop-page";

export const defaultShopPageSettings: ShopPageSettings = {
  id: SETTINGS_ID,
  status: "published",
  hero: normalizeHeroSettings({
    ...defaultHeroSettings,
    heroVariant: "text",
    heroTitle: "Shop",
    heroSubtitle: "Casa Rosier",
    heroImage: "/img/social-2.jpg",
    heroPresentationText: "# Shop\n\nPiezas ceramicas creadas con tiempo, materia y mirada propia.",
  }),
  showCharacteristicsInPreview: true,
  previewCharacteristicLabels: ["Peso", "Medidas", "Caracteristicas"],
  seo_title: "Shop | Casa Rosier",
  seo_description: "Piezas ceramicas disponibles en Casa Rosier.",
  seo_image: "",
  updated_at: "",
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
}

function normalizeShopPageSettings(input: Partial<ShopPageSettings> | null | undefined): ShopPageSettings {
  const row = input as Partial<ShopPageSettings> & {
    show_characteristics_in_preview?: boolean;
    preview_characteristic_labels?: unknown;
  } | null | undefined;

  const labels = stringArray(input?.previewCharacteristicLabels ?? row?.preview_characteristic_labels);

  return {
    ...defaultShopPageSettings,
    ...input,
    id: SETTINGS_ID,
    status: input?.status === "draft" ? "draft" : "published",
    hero: normalizeHeroSettings(input?.hero, {
      heroTitle: "Shop",
      heroSubtitle: "Casa Rosier",
      heroImage: "/img/social-2.jpg",
    }),
    showCharacteristicsInPreview: (input?.showCharacteristicsInPreview ?? row?.show_characteristics_in_preview) !== false,
    previewCharacteristicLabels: labels.length ? labels : defaultShopPageSettings.previewCharacteristicLabels,
    seo_title: String(input?.seo_title ?? defaultShopPageSettings.seo_title),
    seo_description: String(input?.seo_description ?? defaultShopPageSettings.seo_description),
    seo_image: String(input?.seo_image ?? ""),
    updated_at: String(input?.updated_at ?? ""),
  };
}

function toRow(settings: ShopPageSettings) {
  return {
    id: settings.id,
    status: settings.status,
    hero: settings.hero,
    show_characteristics_in_preview: settings.showCharacteristicsInPreview,
    preview_characteristic_labels: settings.previewCharacteristicLabels,
    seo_title: settings.seo_title,
    seo_description: settings.seo_description,
    seo_image: settings.seo_image,
    updated_at: settings.updated_at,
  };
}

async function readFromFile() {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return normalizeShopPageSettings(JSON.parse(raw) as Partial<ShopPageSettings>);
  } catch {
    return defaultShopPageSettings;
  }
}

async function writeToFile(settings: ShopPageSettings) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
}

export async function getShopPageSettings() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", SETTINGS_ID).maybeSingle();
    if (error) throw error;
    if (data) return normalizeShopPageSettings(data as Partial<ShopPageSettings>);
  } catch {
    return readFromFile();
  }

  return readFromFile();
}

export async function updateShopPageSettings(input: Partial<ShopPageSettings>) {
  const next = normalizeShopPageSettings({
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
