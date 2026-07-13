import { NextResponse, type NextRequest } from "next/server";
import { deleteHeaderPermanently, duplicateHeader, getHeaderById, moveHeaderToTrash, restoreHeader, updateHeader } from "@/lib/cms/headers";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const header = await getHeaderById((await context.params).id);
  if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
  return NextResponse.json({ header });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  try {
    const header = await updateHeader((await context.params).id, body);
    if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
    return NextResponse.json({ header });
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
    const header = await duplicateHeader(id);
    if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
    return NextResponse.json({ header });
  }

  if (body.action === "trash") {
    const header = await moveHeaderToTrash(id, session.userEmail);
    if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
    return NextResponse.json({ header });
  }

  if (body.action === "restore") {
    const header = await restoreHeader(id);
    if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
    return NextResponse.json({ header });
  }

  const header = await getHeaderById(id);
  if (!header) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
  const nextStatus = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!nextStatus) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updateHeader(id, { ...header, status: nextStatus });
  return NextResponse.json({ header: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await deleteHeaderPermanently((await context.params).id);
  if (!deleted) return NextResponse.json({ error: "Header no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
