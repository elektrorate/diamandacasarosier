import { NextResponse, type NextRequest } from "next/server";
import { listMediaAssets, type MediaSort, type MediaTypeFilter } from "@/lib/cms/media";
import { isMediaFolder, isMediaStatus } from "@/lib/cms/types";
import { requireAdminApi } from "@/lib/auth/supabase-auth";

const MEDIA_TYPES = new Set<MediaTypeFilter>(["all", "image", "video", "document"]);
const MEDIA_SORTS = new Set<MediaSort>(["newest", "oldest", "name"]);

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const folderValue = url.searchParams.get("folder")?.trim() || "";
  const statusValue = url.searchParams.get("status")?.trim() || "active";
  const typeValue = (url.searchParams.get("type")?.trim() || "all") as MediaTypeFilter;
  const sortValue = (url.searchParams.get("sort")?.trim() || "newest") as MediaSort;

  if (folderValue && !isMediaFolder(folderValue)) {
    return NextResponse.json({ error: "Carpeta no válida." }, { status: 400 });
  }
  if (!isMediaStatus(statusValue)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }
  if (!MEDIA_TYPES.has(typeValue) || !MEDIA_SORTS.has(sortValue)) {
    return NextResponse.json({ error: "Filtro u orden no válido." }, { status: 400 });
  }

  try {
    const result = await listMediaAssets({
      page: positiveInteger(url.searchParams.get("page"), 1),
      pageSize: positiveInteger(url.searchParams.get("pageSize"), 24),
      search: url.searchParams.get("search") ?? "",
      folder: folderValue || undefined,
      status: statusValue,
      type: typeValue,
      sort: sortValue,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la biblioteca multimedia.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}