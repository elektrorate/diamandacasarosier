import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createFooter, getFooters } from "@/lib/cms/footers";
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let items = await getFooters(); if (status) items = items.filter((x) => x.status === status);
  return NextResponse.json({ footers: items });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json(); if (!body?.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  try { const item = await createFooter(body); revalidatePath("/", "layout"); revalidatePath("/admin/components/footers"); return NextResponse.json({ footer: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
