import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createRedirect, getRedirects } from "@/lib/cms/redirects";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const type = request.nextUrl.searchParams.get("redirect_type") || undefined;
  let items = await getRedirects();
  if (status) items = items.filter((x) => x.status === status);
  if (type) items = items.filter((x) => x.redirect_type === type);
  return NextResponse.json({ redirects: items });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.source_url || !body?.target_url) return NextResponse.json({ error: "source_url y target_url son obligatorios." }, { status: 400 });
  try { const item = await createRedirect(body); return NextResponse.json({ redirect: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
