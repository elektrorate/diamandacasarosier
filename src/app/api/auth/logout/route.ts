import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clearLocalSessionCookie } from "@/lib/auth/local-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const sessionCookie = clearLocalSessionCookie();
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );
    await supabase.auth.signOut();
  }

  return response;
}
