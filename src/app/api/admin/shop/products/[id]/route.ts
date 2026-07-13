import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteProductPermanently, duplicateProduct, getProductById, moveProductToTrash, restoreProduct, updateProduct } from "@/lib/cms/products";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getProductById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ product: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateProduct((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ product: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "duplicate") { const item = await duplicateProduct(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ product: item }); }
  if (body.action === "trash") { const item = await moveProductToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ product: item }); }
  if (body.action === "restore") { const item = await restoreProduct(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ product: item }); }
  const item = await getProductById(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (body.action === "publish") { const u = await updateProduct(id, { status: "published" }); return NextResponse.json({ product: u }); }
  if (body.action === "draft") { const u = await updateProduct(id, { status: "draft" }); return NextResponse.json({ product: u }); }
  if (body.action === "archive") { const u = await updateProduct(id, { status: "archived" }); return NextResponse.json({ product: u }); }
  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteProductPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ ok: true });
}
