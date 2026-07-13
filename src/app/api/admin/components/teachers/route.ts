import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createTeacher, getTeachers } from "@/lib/cms/teachers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let items = await getTeachers(); if (status) items = items.filter((x) => x.status === status);
  return NextResponse.json({ teachers: items });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json(); if (!body?.name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  try { const item = await createTeacher(body); return NextResponse.json({ teacher: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
