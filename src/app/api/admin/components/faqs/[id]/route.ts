import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteFaqPermanently, duplicateFaq, getFaqById, moveFaqToTrash, restoreFaq, updateFaq } from "@/lib/cms/faqs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getFaqById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ faq: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateFaq((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ faq: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "duplicate") { const item = await duplicateFaq(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ faq: item }); }
  if (body.action === "trash") { const item = await moveFaqToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ faq: item }); }
  if (body.action === "restore") { const item = await restoreFaq(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ faq: item }); }
  const item = await getFaqById(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const ns = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!ns) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updateFaq(id, { ...item, status: ns }); return NextResponse.json({ faq: updated });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteFaqPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ ok: true });
}
