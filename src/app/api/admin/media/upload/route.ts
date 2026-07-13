import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMediaAsset } from "@/lib/cms/media";
import { optimizeImageForUpload } from "@/lib/cms/image-optimization";

import { isMediaFolder } from "@/lib/cms/types";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const STORAGE_BUCKET = "media";
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "pdf"]);
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = String(formData.get("folder") || "general").trim();
  const altText = String(formData.get("alt_text") || "").trim();
  const title = String(formData.get("title") || "").trim();

  if (!file || !file.name) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (!isMediaFolder(folder)) {
    return NextResponse.json({ error: "Folder no válido." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: `Extensión .${ext} no permitida. Solo se aceptan imágenes y PDF.` }, { status: 400 });
  }

  if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json({ error: "Tipo de archivo no permitido." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo supera el límite de 10 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const optimizedFile = await optimizeImageForUpload({
      buffer,
      extension: ext,
      mimeType: file.type,
    });
    const safeName = `${Date.now()}-${randomUUID().slice(0, 8)}.${optimizedFile.extension}`;
    const storagePath = `${folder}/${safeName}`;
    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, optimizedFile.buffer, {
        contentType: optimizedFile.mimeType,
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    const fileUrl = publicUrlData.publicUrl;

    const asset = await createMediaAsset({
      file_name: storagePath,
      original_name: file.name,
      file_url: fileUrl,
      file_type: optimizedFile.extension,
      mime_type: optimizedFile.mimeType,
      size: optimizedFile.size,
      alt_text: altText,
      title: title || file.name,
      description: "",
      folder,
      tags: optimizedFile.optimized ? ["optimized"] : [],
      status: "active",
    });

    return NextResponse.json({
      asset,
      optimization: {
        optimized: optimizedFile.optimized,
        originalSize: optimizedFile.originalSize,
        finalSize: optimizedFile.size,
        savedBytes: optimizedFile.savedBytes,
        reductionPercent: optimizedFile.reductionPercent,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir el archivo a Supabase Storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
