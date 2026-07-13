import { NextResponse } from "next/server";
import { getStudioPageSettings, updateStudioPageSettings } from "@/lib/cms/studio-page";

export async function GET() {
  return NextResponse.json({ page: await getStudioPageSettings() });
}

export async function PUT(request: Request) {
  try {
    const page = await updateStudioPageSettings(await request.json());
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar la página." }, { status: 400 });
  }
}
