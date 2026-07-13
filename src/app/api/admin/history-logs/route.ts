import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getHistoryLogsPage, type DateSort } from "@/lib/cms/history-logs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const action = request.nextUrl.searchParams.get("action") || undefined;
  const entityType = request.nextUrl.searchParams.get("entity_type") || undefined;
  const date = request.nextUrl.searchParams.get("date") || undefined;
  const page = Number(request.nextUrl.searchParams.get("page") || 1);
  const pageSize = Number(request.nextUrl.searchParams.get("page_size") || 30);
  const sort = (request.nextUrl.searchParams.get("sort") || "newest") as DateSort;
  const result = await getHistoryLogsPage({ page, pageSize, sort, action, entityType, date });
  return NextResponse.json({ logs: result.items, ...result });
}
