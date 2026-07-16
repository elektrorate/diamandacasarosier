import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { createAdminClient } from "../supabase/admin";
import { getCurrentLocalSession, LOCAL_ADMIN_EMAIL } from "./local-auth";

export type AdminRole = "admin" | "editor" | "teacher" | "collaborator";

export interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: AdminRole;
  avatar_url: string | null;
}

export const ADMIN_ROLES: AdminRole[] = ["admin", "editor"];

function isLocalAuthBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_AUTH_BYPASS === "true";
}

function hasSupabaseAuthEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function createSupabaseAuthClient() {
  if (!hasSupabaseAuthEnv()) return null;

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Read-only Server Component contexts cannot mutate cookies.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseAuthClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function getProfile(userId: string): Promise<AdminProfile | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data as AdminProfile | null;
  } catch {
    return null;
  }
}

export async function getProfileByEmail(email: string): Promise<AdminProfile | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    return data as AdminProfile | null;
  } catch {
    return null;
  }
}

export async function ensureProfile(userId: string, email: string): Promise<AdminProfile | null> {
  const existing = await getProfile(userId);
  if (existing) return existing;

  try {
    const admin = createAdminClient();
    const profileCount = await getProfileCount();
    const role: AdminRole = profileCount === 0 ? "admin" : "editor";
    const { data, error } = await admin
      .from("profiles")
      .insert({ id: userId, email: email.toLowerCase(), role, full_name: email.split("@")[0] })
      .select()
      .maybeSingle();
    if (error) return null;
    return data as AdminProfile;
  } catch {
    return null;
  }
}

async function getProfileCount(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count } = await admin.from("profiles").select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export function isAdminRole(role: string): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

async function requireAdminProfileUncached(): Promise<{ user: { id: string; email?: string | null }; profile: AdminProfile } | null> {
  if (isLocalAuthBypassEnabled()) {
    return {
      user: { id: "local-bypass-admin", email: LOCAL_ADMIN_EMAIL },
      profile: {
        id: "local-bypass-admin",
        full_name: "Local Admin",
        email: LOCAL_ADMIN_EMAIL,
        role: "admin",
        avatar_url: null,
      },
    };
  }
  const localSession = await getCurrentLocalSession();
  if (localSession) {
    return {
      user: { id: "bootstrap-admin", email: localSession.email },
      profile: {
        id: "bootstrap-admin",
        full_name: "Admin User",
        email: localSession.email,
        role: "admin",
        avatar_url: null,
      },
    };
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile) return null;
  if (!isAdminRole(profile.role)) return null;

  return { user, profile };
}

export const requireAdminProfile = cache(requireAdminProfileUncached);

export interface AdminSession {
  userId: string;
  userEmail: string;
}

export async function requireAdminApi(): Promise<AdminSession | null> {
  if (isLocalAuthBypassEnabled()) {
    return { userId: "local-bypass-admin", userEmail: LOCAL_ADMIN_EMAIL };
  }
  const localSession = await getCurrentLocalSession();
  if (localSession) {
    return { userId: "bootstrap-admin", userEmail: localSession.email };
  }

  try {
    const supabase = await createSupabaseAuthClient();
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (user?.email) {
      const profile = await getProfileByEmail(user.email);
      if (profile && isAdminRole(profile.role)) {
        return { userId: user.id, userEmail: user.email };
      }
    }

    const profile = await getProfileByEmail(LOCAL_ADMIN_EMAIL);
    if (profile && isAdminRole(profile.role)) return { userId: profile.id, userEmail: profile.email };
    return null;
  } catch {
    return null;
  }
}
