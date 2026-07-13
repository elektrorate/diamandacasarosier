import { NextResponse, type NextRequest } from "next/server";
import { deleteMediaAsset, getMediaAssetById, isMediaImage, moveMediaToTrash, restoreMediaAsset } from "@/lib/cms/media";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Falta el id del asset." }, { status: 400 });
  }

  if (action === "trash") {
    const asset = await moveMediaToTrash(id, session.userEmail);
    if (!asset) {
      return NextResponse.json({ error: "Asset no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ asset });
  }

  if (action === "restore") {
    const asset = await restoreMediaAsset(id);
    if (!asset) {
      return NextResponse.json({ error: "Asset no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ asset });
  }

  if (action === "permanent") {
    const asset = await getMediaAssetById(id);
    if (!asset) {
      return NextResponse.json({ error: "Asset no encontrado." }, { status: 404 });
    }
    if (!isMediaImage(asset)) {
      return NextResponse.json({ error: "Solo las fotos se pueden eliminar desde Multimedia." }, { status: 400 });
    }

    const deleted = await deleteMediaAsset(id);
    if (!deleted) {
      return NextResponse.json({ error: "No se pudo eliminar la foto en Supabase." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida. Usa trash, restore o permanent." }, { status: 400 });
}
