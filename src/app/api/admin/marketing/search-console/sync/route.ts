import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { syncSearchConsoleData } from "@/lib/cms/marketing";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const result = await syncSearchConsoleData(body.date_from, body.date_to);
  return NextResponse.json(result);
}
