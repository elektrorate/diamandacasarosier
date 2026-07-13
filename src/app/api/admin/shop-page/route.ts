import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getShopPageSettings, updateShopPageSettings } from "@/lib/cms/shop-page";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ page: await getShopPageSettings() });
}

export async function PUT(request: Request) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const page = await updateShopPageSettings(await request.json());
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar Shop." }, { status: 400 });
  }
}
