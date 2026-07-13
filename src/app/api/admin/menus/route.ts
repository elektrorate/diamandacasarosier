import { NextResponse, type NextRequest } from "next/server";
import { createMenu, getMenus } from "@/lib/cms/menus";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const location = request.nextUrl.searchParams.get("location") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let menus = await getMenus();
  if (location) menus = menus.filter((m) => m.location === location);
  if (status) menus = menus.filter((m) => m.status === status);
  return NextResponse.json({ menus });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  try {
    const menu = await createMenu(body);
    return NextResponse.json({ menu });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear menú" }, { status: 400 });
  }
}
