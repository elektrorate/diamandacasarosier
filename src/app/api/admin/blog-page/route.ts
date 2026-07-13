import { NextResponse } from "next/server";
import { getBlogPageSettings, updateBlogPageSettings } from "@/lib/cms/blog-page";

export async function GET() {
  return NextResponse.json({ page: await getBlogPageSettings() });
}

export async function PUT(request: Request) {
  try {
    const page = await updateBlogPageSettings(await request.json());
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar la página." }, { status: 400 });
  }
}
