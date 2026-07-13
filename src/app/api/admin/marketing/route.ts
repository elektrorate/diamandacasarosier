import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getMarketingSettings, updateMarketingSettings } from "@/lib/cms/marketing";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getMarketingSettings();
  const masked = { ...settings, meta_access_token: settings.meta_access_token ? "••••••" + settings.meta_access_token.slice(-4) : "" };
  return NextResponse.json(masked);
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const updated = await updateMarketingSettings(body);
  return NextResponse.json(updated);
}
