import { createAdminClient } from "../supabase/admin";
import { readJsonFile } from "./local-storage";
import type { Redirect } from "./types";

const CACHE_TTL_MS = Number(process.env.CMS_REDIRECT_CACHE_MS ?? 15_000);
const USE_LOCAL_DATA = process.env.CMS_USE_LOCAL_DATA === "true";
type PublicRedirect = Pick<Redirect, "id" | "source_url" | "target_url" | "redirect_type">;
let cachedRedirects: { items: PublicRedirect[]; expiresAt: number } | null = null;
let pendingRedirects: Promise<PublicRedirect[]> | null = null;

async function fetchActiveRedirects() {
  if (USE_LOCAL_DATA) {
    const items = await readJsonFile<Redirect[]>("redirects.json", []);
    return items.filter((item) => item.status === "active" && item.deleted_at === null) as PublicRedirect[];
  }

  try {
    const { data, error } = await createAdminClient()
      .from("redirects")
      .select("id,source_url,target_url,redirect_type")
      .eq("status", "active")
      .is("deleted_at", null);
    if (error) throw error;
    return (data ?? []) as PublicRedirect[];
  } catch (error) {
    console.error("No se pudieron cargar las redirecciones publicas:", error);
    return [];
  }
}

export async function getActivePublicRedirects() {
  if (cachedRedirects && cachedRedirects.expiresAt > Date.now()) return cachedRedirects.items;
  if (pendingRedirects) return pendingRedirects;
  pendingRedirects = fetchActiveRedirects()
    .then((items) => {
      cachedRedirects = { items, expiresAt: Date.now() + Math.max(0, CACHE_TTL_MS) };
      return items;
    })
    .finally(() => { pendingRedirects = null; });
  return pendingRedirects;
}

export function invalidatePublicRedirectCache() {
  cachedRedirects = null;
  pendingRedirects = null;
}
