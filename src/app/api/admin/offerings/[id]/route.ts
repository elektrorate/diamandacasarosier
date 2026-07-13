import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import {
  deleteOfferingPermanently,
  duplicateOffering,
  getOfferingById,
  moveOfferingToTrash,
  restoreOffering,
  updateOffering,
} from "@/lib/cms/offerings";
import { invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import type { Offering } from "@/lib/cms/types";

function publicOfferingPath(offering: Pick<Offering, "type" | "slug"> | null | undefined) {
  if (!offering?.slug) return null;
  if (offering.type === "workshop") return `/workshops/${offering.slug}`;
  if (offering.type === "experience") return `/experiencias/${offering.slug}`;
  if (offering.type === "gift_card") return `/gift-cards/${offering.slug}`;
  return `/clases/${offering.slug}`;
}

function refreshOfferingAdminPaths(...offerings: Array<Pick<Offering, "type" | "slug"> | null | undefined>) {
  invalidatePublicNavigationCache();
  revalidatePath("/admin/clases");
  revalidatePath("/admin/workshops");
  revalidatePath("/admin/experiencias");
  revalidatePath("/admin/gift-cards");
  revalidatePath("/");
  revalidatePath("/clases");
  revalidatePath("/workshops");
  revalidatePath("/experiencias");
  revalidatePath("/gift-cards");
  revalidatePath("/el-estudio");
  revalidatePath("/shop");
  for (const offering of offerings) {
    const path = publicOfferingPath(offering);
    if (path) revalidatePath(path);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  try {
    const previous = await getOfferingById(id);
    const offering = await updateOffering(id, body);

    if (!offering) {
      return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
    }

    refreshOfferingAdminPaths(previous, offering);
    return NextResponse.json({ offering });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo actualizar el offering" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action === "duplicate") {
    const offering = await duplicateOffering(id);
    if (!offering) {
      return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
    }
    refreshOfferingAdminPaths(offering);
    return NextResponse.json({ offering });
  }

  if (body.action === "trash") {
    const previous = await getOfferingById(id);
    const offering = await moveOfferingToTrash(id, session.userEmail);
    if (!offering) {
      return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
    }
    refreshOfferingAdminPaths(previous, offering);
    return NextResponse.json({ offering });
  }

  if (body.action === "restore") {
    const offering = await restoreOffering(id);
    if (!offering) {
      return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
    }
    refreshOfferingAdminPaths(offering);
    return NextResponse.json({ offering });
  }

  const offering = await getOfferingById(id);
  if (!offering) {
    return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
  }

  const nextStatus = body.action === "publish" ? "published" : body.action === "archive" ? "archived" : body.action === "draft" ? "draft" : null;
  if (!nextStatus) {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  const updated = await updateOffering(id, { ...offering, status: nextStatus });
  refreshOfferingAdminPaths(offering, updated);
  return NextResponse.json({ offering: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const previous = await getOfferingById(id);
  const deleted = await deleteOfferingPermanently(id);
  if (!deleted) {
    return NextResponse.json({ error: "Offering no encontrado" }, { status: 404 });
  }

  refreshOfferingAdminPaths(previous);
  return NextResponse.json({ ok: true });
}
