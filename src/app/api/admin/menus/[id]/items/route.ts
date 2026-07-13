import { NextResponse, type NextRequest } from "next/server";
import { addMenuItem, deleteMenuItem, reorderMenuItems, updateMenuItem } from "@/lib/cms/menus";
import { invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.label) return NextResponse.json({ error: "La etiqueta es obligatoria." }, { status: 400 });
  try {
    const item = await addMenuItem((await context.params).id, body);
    if (!item) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    invalidatePublicNavigationCache();
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear item" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "reorder" && Array.isArray(body.orderedItemIds)) {
    const items = await reorderMenuItems((await context.params).id, body.orderedItemIds);
    if (!items) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    invalidatePublicNavigationCache();
    return NextResponse.json({ items });
  }
  const { itemId, ...data } = body;
  if (!itemId) return NextResponse.json({ error: "itemId es obligatorio" }, { status: 400 });
  try {
    const updated = await updateMenuItem((await context.params).id, itemId, data);
    if (!updated) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    invalidatePublicNavigationCache();
    return NextResponse.json({ item: updated });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar item" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId es obligatorio" }, { status: 400 });
  try {
    const deleted = await deleteMenuItem((await context.params).id, itemId);
    if (!deleted) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    invalidatePublicNavigationCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar item" }, { status: 400 });
  }
}
