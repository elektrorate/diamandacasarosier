import { NextResponse, type NextRequest } from "next/server";
import { updateMediaAsset } from "@/lib/cms/media";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...data } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Falta el id del asset." }, { status: 400 });
  }

  const updated = await updateMediaAsset(id, data);
  if (!updated) {
    return NextResponse.json({ error: "Asset no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ asset: updated });
}
