import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getTrashItemsPage, type TrashDateSort } from "@/lib/cms/trash";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = Number(request.nextUrl.searchParams.get("page") || 1);
  const pageSize = Number(request.nextUrl.searchParams.get("page_size") || 30);
  const sort = (request.nextUrl.searchParams.get("sort") || "newest") as TrashDateSort;
  const entityType = request.nextUrl.searchParams.get("entity_type") || "all";
  const query = request.nextUrl.searchParams.get("q") || "";

  const result = await getTrashItemsPage({ page, pageSize, sort, entityType, query });
  return NextResponse.json(result);
}
