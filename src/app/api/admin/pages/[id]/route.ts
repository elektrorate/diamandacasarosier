import { NextResponse, type NextRequest } from "next/server";
import { deletePagePermanently, duplicatePage, getPageById, movePageToTrash, restorePage, updatePage } from "@/lib/cms/pages";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const page = await getPageById((await context.params).id);
  if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  try {
    const page = await updatePage((await context.params).id, body);
    if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "duplicate") {
    const page = await duplicatePage(id);
    if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    return NextResponse.json({ page });
  }
  if (body.action === "trash") {
    const page = await movePageToTrash(id, session.userEmail);
    if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    return NextResponse.json({ page });
  }
  if (body.action === "restore") {
    const page = await restorePage(id);
    if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    return NextResponse.json({ page });
  }
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  const nextStatus = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!nextStatus) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updatePage(id, { ...page, status: nextStatus });
  return NextResponse.json({ page: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await deletePagePermanently((await context.params).id);
  if (!deleted) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
