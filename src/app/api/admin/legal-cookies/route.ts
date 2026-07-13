import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getLegalSettings, updateLegalSettings } from "@/lib/cms/legal";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getLegalSettings();
  return NextResponse.json({
    privacy_policy_title: settings.privacy_policy_title,
    privacy_policy_content: settings.privacy_policy_content,
    updated_at: settings.updated_at,
  });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const updated = await updateLegalSettings(body);
  revalidatePath("/politica-privacidad");
  return NextResponse.json(updated);
}
