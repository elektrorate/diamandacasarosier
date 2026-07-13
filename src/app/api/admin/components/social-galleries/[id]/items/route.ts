import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { invalidatePublicContentCache } from "@/lib/cms/public-content";
import { addSocialGalleryItem, getSocialGalleryById, reorderSocialGalleryItems, removeSocialGalleryItem } from "@/lib/cms/social-galleries";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

function refreshSocialGalleryViews() {
  invalidatePublicContentCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin/components/social-galleries");
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const item = await addSocialGalleryItem((await ctx.params).id, { id: randomUUID(), image_id: body.image_id || "", image_url: body.image_url || "", title: body.title || "", description: body.description || "", instagram_url: body.instagram_url || "", sort_order: body.sort_order ?? 0, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  if (!item) return NextResponse.json({ error: "Galería no encontrada" }, { status: 404 });
  refreshSocialGalleryViews();
  return NextResponse.json({ item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
    const items = await reorderSocialGalleryItems((await ctx.params).id, body.orderedIds);
    if (!items) return NextResponse.json({ error: "Galería no encontrada" }, { status: 404 }); refreshSocialGalleryViews(); return NextResponse.json({ items });
  }
  const gallery = await getSocialGalleryById((await ctx.params).id); if (!gallery) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  const idx = gallery.items.findIndex((i) => i.id === body.itemId); if (idx === -1) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  const updated = { ...gallery.items[idx], ...body, id: body.itemId, updated_at: new Date().toISOString() };
  gallery.items[idx] = updated; gallery.updated_at = new Date().toISOString();
  const { updateSocialGallery } = await import("@/lib/cms/social-galleries");
  await updateSocialGallery((await ctx.params).id, gallery); refreshSocialGalleryViews(); return NextResponse.json({ item: updated });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const itemId = request.nextUrl.searchParams.get("itemId"); if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
  const ok = await removeSocialGalleryItem((await ctx.params).id, itemId); if (!ok) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  refreshSocialGalleryViews();
  return NextResponse.json({ ok: true });
}
