import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getReports, createReport } from "@/lib/cms/marketing";
import { MARKETING_REPORT_TYPES } from "@/lib/cms/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reports = await getReports();
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (!MARKETING_REPORT_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Tipo de reporte inválido." }, { status: 400 });
    }
    if (!body.date_from || !body.date_to) {
      return NextResponse.json({ error: "Selecciona un rango de fechas." }, { status: 400 });
    }
    const report = await createReport(body);
    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
