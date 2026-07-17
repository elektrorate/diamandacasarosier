import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteMenuPermanently, duplicateMenu, getMenuById, moveMenuToTrash, restoreMenu, updateMenu } from "@/lib/cms/menus";
import { invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

function refreshPublicMenu() {
  invalidatePublicNavigationCache();
  revalidatePath("/");
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const menu = await getMenuById((await context.params).id);
  if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
  return NextResponse.json({ menu });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  try {
    const menu = await updateMenu((await context.params).id, body);
    if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    refreshPublicMenu();
    return NextResponse.json({ menu });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = body.action;

  if (action === "duplicate") {
    const menu = await duplicateMenu(id);
    if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    refreshPublicMenu();
    return NextResponse.json({ menu });
  }

  if (action === "trash") {
    const menu = await moveMenuToTrash(id, session.userEmail);
    if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    refreshPublicMenu();
    return NextResponse.json({ menu });
  }

  if (action === "restore") {
    const menu = await restoreMenu(id);
    if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
    refreshPublicMenu();
    return NextResponse.json({ menu });
  }

  const menu = await getMenuById(id);
  if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
  const nextStatus = action === "activate" ? "active" : action === "draft" ? "draft" : action === "archive" ? "archived" : null;
  if (!nextStatus) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updateMenu(id, { ...menu, status: nextStatus });
  refreshPublicMenu();
  return NextResponse.json({ menu: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await deleteMenuPermanently((await context.params).id);
  if (!deleted) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });
  refreshPublicMenu();
  return NextResponse.json({ ok: true });
}
