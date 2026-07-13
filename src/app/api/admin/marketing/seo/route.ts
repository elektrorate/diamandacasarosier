import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getSeoAudit } from "@/lib/cms/marketing";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const audit = await getSeoAudit();
  return NextResponse.json(audit);
}
