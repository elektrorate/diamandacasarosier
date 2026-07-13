import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteFooterPermanently, duplicateFooter, getFooterById, moveFooterToTrash, restoreFooter, updateFooter } from "@/lib/cms/footers";
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function revalidateFooterViews() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/components/footers");
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getFooterById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ footer: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateFooter((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); revalidateFooterViews(); return NextResponse.json({ footer: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "duplicate") { const item = await duplicateFooter(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); revalidateFooterViews(); return NextResponse.json({ footer: item }); }
  if (body.action === "trash") { const item = await moveFooterToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); revalidateFooterViews(); return NextResponse.json({ footer: item }); }
  if (body.action === "restore") { const item = await restoreFooter(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); revalidateFooterViews(); return NextResponse.json({ footer: item }); }
  const item = await getFooterById(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const ns = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!ns) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updateFooter(id, { ...item, status: ns }); revalidateFooterViews(); return NextResponse.json({ footer: updated });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteFooterPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); revalidateFooterViews(); return NextResponse.json({ ok: true });
}
