import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getBlogPageSettings, updateBlogPageSettings } from "@/lib/cms/blog-page";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ page: await getBlogPageSettings() });
}

export async function PUT(request: Request) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const page = await updateBlogPageSettings(await request.json());
    revalidatePath("/blog");
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar la página." }, { status: 400 });
  }
}
