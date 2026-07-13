import { createAdminClient } from "../supabase/admin";
import { readJsonFile, writeJsonFile } from "./local-storage";
import { defaultLegalSettings } from "./types";
import type { LegalSettings } from "./types";
import type { LegalSettingInsert, LegalSettingUpdate } from "../supabase/types";

const FILE_NAME = "legal-settings.json";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000003";

function flattenLegal(s: LegalSettings): LegalSettingUpdate {
  return {
    banner_enabled: s.cookies_banner_enabled,
    banner_text: s.cookies_banner_text || null,
    cookies_banner_title: s.cookies_banner_title || null,
    cookies_banner_text: s.cookies_banner_text || null,
    accept_button_text: s.accept_button_text,
    reject_button_text: s.reject_button_text,
    preferences_button_text: s.preferences_button_text,
    consent_categories: [],
    analytics_consent_required: s.analytics_consent_required,
    marketing_consent_required: s.marketing_consent_required,
    functional_consent_required: s.functional_consent_required,
    privacy_policy_title: s.privacy_policy_title || null,
    privacy_policy_content: s.privacy_policy_content || null,
    privacy_policy_url: null,
    cookies_policy_title: s.cookies_policy_title || null,
    cookies_policy_content: s.cookies_policy_content || null,
    cookie_policy_url: null,
    legal_notice_title: s.legal_notice_title || null,
    legal_notice_content: s.legal_notice_content || null,
    legal_notice_url: null,
    terms_title: s.terms_title || null,
    terms_content: s.terms_content || null,
    terms_url: null,
    purchase_terms_content: s.purchase_terms_content || null,
    consent_mode_enabled: s.consent_mode_enabled,
    google_consent_mode_enabled: s.google_consent_mode_enabled,
    meta_consent_mode_enabled: s.meta_consent_mode_enabled,
  };
}

function rowToLegal(
  row: {
    banner_enabled: boolean;
    banner_text: string | null;
    cookies_banner_title: string | null;
    cookies_banner_text: string | null;
    accept_button_text: string;
    reject_button_text: string;
    preferences_button_text: string;
    analytics_consent_required: boolean;
    marketing_consent_required: boolean;
    functional_consent_required: boolean;
    privacy_policy_title: string | null;
    privacy_policy_content: string | null;
    cookies_policy_title: string | null;
    cookies_policy_content: string | null;
    legal_notice_title: string | null;
    legal_notice_content: string | null;
    terms_title: string | null;
    terms_content: string | null;
    purchase_terms_content: string | null;
    consent_mode_enabled: boolean;
    google_consent_mode_enabled: boolean;
    meta_consent_mode_enabled: boolean;
    updated_at: string;
  },
): LegalSettings {
  return {
    cookies_banner_enabled: row.banner_enabled,
    cookies_banner_title: row.cookies_banner_title ?? "",
    cookies_banner_text: row.cookies_banner_text ?? "",
    accept_button_text: row.accept_button_text,
    reject_button_text: row.reject_button_text,
    preferences_button_text: row.preferences_button_text,
    analytics_consent_required: row.analytics_consent_required,
    marketing_consent_required: row.marketing_consent_required,
    functional_consent_required: row.functional_consent_required,
    privacy_policy_title: row.privacy_policy_title ?? "",
    privacy_policy_content: row.privacy_policy_content ?? "",
    cookies_policy_title: row.cookies_policy_title ?? "",
    cookies_policy_content: row.cookies_policy_content ?? "",
    legal_notice_title: row.legal_notice_title ?? "",
    legal_notice_content: row.legal_notice_content ?? "",
    terms_title: row.terms_title ?? "",
    terms_content: row.terms_content ?? "",
    purchase_terms_content: row.purchase_terms_content ?? "",
    consent_mode_enabled: row.consent_mode_enabled,
    google_consent_mode_enabled: row.google_consent_mode_enabled,
    meta_consent_mode_enabled: row.meta_consent_mode_enabled,
    updated_at: row.updated_at,
  };
}

async function readFromSupabase(): Promise<LegalSettings | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("legal_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return rowToLegal(data as Parameters<typeof rowToLegal>[0]);
  } catch {
    return null;
  }
}

async function writeToSupabase(settings: LegalSettings): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const flat = flattenLegal(settings) as Record<string, unknown>;
    flat.updated_at = new Date().toISOString();
    const { data: existing } = await supabase
      .from("legal_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from("legal_settings")
        .update(flat)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("legal_settings")
        .insert({ id: SETTINGS_ID, ...flat } as LegalSettingInsert);
      if (error) throw error;
    }
    return true;
  } catch {
    return false;
  }
}

export async function getLegalSettings(): Promise<LegalSettings> {
  const fromSupabase = await readFromSupabase();
  if (fromSupabase) {
    return fromSupabase;
  }
  const data = await readJsonFile<Partial<LegalSettings>>(FILE_NAME, {});
  return { ...defaultLegalSettings(), ...data };
}

export async function updateLegalSettings(input: Partial<LegalSettings>): Promise<LegalSettings> {
  const current = await getLegalSettings();
  const next: LegalSettings = { ...current, ...input, updated_at: new Date().toISOString() };
  await writeToSupabase(next);
  await writeJsonFile(FILE_NAME, next);
  return next;
}
