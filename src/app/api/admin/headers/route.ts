import { NextResponse, type NextRequest } from "next/server";
import { createHeader, getHeaders } from "@/lib/cms/headers";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let headers = await getHeaders();
  if (type) headers = headers.filter((h) => h.type === type);
  if (status) headers = headers.filter((h) => h.status === status);
  return NextResponse.json({ headers });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  try {
    const header = await createHeader(body);
    return NextResponse.json({ header });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear header" }, { status: 400 });
  }
}
