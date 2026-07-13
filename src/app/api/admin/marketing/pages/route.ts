import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getPageMetrics } from "@/lib/cms/marketing";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("date_from") || undefined;
  const dateTo = searchParams.get("date_to") || undefined;
  const metrics = await getPageMetrics(dateFrom, dateTo);
  return NextResponse.json(metrics);
}
