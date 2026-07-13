import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { invalidatePublicContentCache } from "@/lib/cms/public-content";
import { deleteTestimonialPermanently, duplicateTestimonial, getTestimonialById, moveTestimonialToTrash, restoreTestimonial, updateTestimonial } from "@/lib/cms/testimonials";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

function refreshTestimonialViews() {
  invalidatePublicContentCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin/components/testimonials");
}

async function getItem(id: string) { return getTestimonialById(id); }
async function updateItem(id: string, data: Record<string, unknown>) { return updateTestimonial(id, data); }
async function trashItem(id: string) { return moveTestimonialToTrash(id); }
async function restoreItem(id: string) { return restoreTestimonial(id); }
async function dupeItem(id: string) { return duplicateTestimonial(id); }
async function deleteItem(id: string) { return deleteTestimonialPermanently(id); }

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getItem((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ testimonial: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateItem((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshTestimonialViews(); return NextResponse.json({ testimonial: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "No se pudo guardar el testimonio." }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "duplicate") { const item = await dupeItem(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshTestimonialViews(); return NextResponse.json({ testimonial: item }); }
  if (body.action === "trash") { const item = await trashItem(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshTestimonialViews(); return NextResponse.json({ testimonial: item }); }
  if (body.action === "restore") { const item = await restoreItem(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshTestimonialViews(); return NextResponse.json({ testimonial: item }); }
  const item = await getItem(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const ns = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!ns) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updateItem(id, { ...item, status: ns }); refreshTestimonialViews(); return NextResponse.json({ testimonial: updated });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteItem((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshTestimonialViews(); return NextResponse.json({ ok: true });
}
