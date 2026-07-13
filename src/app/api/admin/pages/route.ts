import { NextResponse, type NextRequest } from "next/server";
import { createPage, getPages } from "@/lib/cms/pages";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let pages = await getPages();
  if (type) pages = pages.filter((p) => p.type === type);
  if (status) pages = pages.filter((p) => p.status === status);
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.title) return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
  try {
    const page = await createPage(body);
    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear página" }, { status: 400 });
  }
}
