import { NextResponse, type NextRequest } from "next/server";
import { getMediaAssets } from "@/lib/cms/media";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const folder = url.searchParams.get("folder");
  const status = url.searchParams.get("status");

  let assets = await getMediaAssets();

  if (folder) {
    assets = assets.filter((a) => a.folder === folder);
  }
  if (status) {
    assets = assets.filter((a) => a.status === status);
  }

  return NextResponse.json({ assets });
}
