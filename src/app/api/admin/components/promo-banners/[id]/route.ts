import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { revalidatePath } from "next/cache";
import { activatePromoBannerNow, deletePromoBannerPermanently, duplicatePromoBanner, getPromoBannerById, movePromoBannerToTrash, restorePromoBanner, updatePromoBanner } from "@/lib/cms/promo-banners";
import { invalidatePublicContentCache } from "@/lib/cms/public-content";
import { type NextRequest, NextResponse } from "next/server";

function getPromoBannerErrorMessage(err: unknown) {
  const message = err instanceof Error ? err.message : "No se pudo guardar el banner promocional.";
  const lower = message.toLowerCase();
  if (lower.includes("promo_banners_text_length") || lower.includes("promo_banners_detail_text_length")) {
    return "Supabase todavía tiene el límite anterior para las descripciones del banner. Aplica la migración 018_promo_banner_rich_text_limits.sql y vuelve a guardar.";
  }
  if (lower === "error") return "No se pudo guardar el banner promocional.";
  return message;
}

function refreshPromoSurfaces() {
  invalidatePublicContentCache();
  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/admin/components/promo-banners");
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getPromoBannerById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ promoBanner: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updatePromoBanner((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshPromoSurfaces(); return NextResponse.json({ promoBanner: item }); }
  catch (err) { return NextResponse.json({ error: getPromoBannerErrorMessage(err) }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "duplicate") { const item = await duplicatePromoBanner(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshPromoSurfaces(); return NextResponse.json({ promoBanner: item, message: "Banner duplicado como borrador." }); }
    if (body.action === "trash") { const item = await movePromoBannerToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshPromoSurfaces(); return NextResponse.json({ promoBanner: item, message: "Banner movido a la papelera." }); }
    if (body.action === "restore") { const item = await restorePromoBanner(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshPromoSurfaces(); return NextResponse.json({ promoBanner: item, message: "Banner restaurado como borrador." }); }
    if (body.action === "publish") {
      const result = await activatePromoBannerNow(id);
      if (!result) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      refreshPromoSurfaces();
      return NextResponse.json({
        promoBanner: result.promoBanner,
        archivedCount: result.archivedCount,
        message: result.archivedCount > 0
          ? "Banner activo. El banner anterior pasó a borrador automáticamente."
          : "Banner activo y visible en el home.",
      });
    }
  } catch (err) {
    return NextResponse.json({ error: getPromoBannerErrorMessage(err) }, { status: 400 });
  }
  const item = await getPromoBannerById(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const ns = body.action === "publish" ? "published" : body.action === "archive" || body.action === "draft" ? "draft" : null;
  if (!ns) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const updated = await updatePromoBanner(id, { ...item, status: ns }); refreshPromoSurfaces(); return NextResponse.json({ promoBanner: updated });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deletePromoBannerPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); refreshPromoSurfaces(); return NextResponse.json({ ok: true });
}
