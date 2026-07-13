import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createFaq, getFaqs } from "@/lib/cms/faqs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined; const cat = request.nextUrl.searchParams.get("category") || undefined;
  let items = await getFaqs(); if (status) items = items.filter((x) => x.status === status); if (cat) items = items.filter((x) => x.category === cat);
  return NextResponse.json({ faqs: items });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json(); if (!body?.question) return NextResponse.json({ error: "La pregunta es obligatoria." }, { status: 400 });
  try { const item = await createFaq(body); return NextResponse.json({ faq: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
