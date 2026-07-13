import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getFormSubmissions } from "@/lib/cms/form-submissions";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const formId = request.nextUrl.searchParams.get("form_id") || undefined;
  const date = request.nextUrl.searchParams.get("date") || undefined;
  let items = await getFormSubmissions();
  if (status) items = items.filter((x) => x.status === status);
  if (formId) items = items.filter((x) => x.form_id === formId);
  if (date) items = items.filter((x) => x.created_at.startsWith(date));
  return NextResponse.json({ submissions: items });
}
