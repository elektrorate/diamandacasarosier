import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createForm, getForms } from "@/lib/cms/forms";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let items = await getForms();
  if (type) items = items.filter((x) => x.type === type);
  if (status) items = items.filter((x) => x.status === status);
  return NextResponse.json({ forms: items });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  try { const item = await createForm(body); return NextResponse.json({ form: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
