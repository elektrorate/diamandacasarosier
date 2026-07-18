import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createPromoBanner, deactivatePromoBannerModal, getPromoBanners } from "@/lib/cms/promo-banners";
import { invalidatePublicContentCache } from "@/lib/cms/public-content";
import { revalidatePath } from "next/cache";
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

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  let items = await getPromoBanners(); if (status) items = items.filter((x) => x.status === status);
  return NextResponse.json({ promoBanners: items });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json(); if (!body?.title) return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
  try { const item = await createPromoBanner(body); invalidatePublicContentCache(); revalidatePath("/"); revalidatePath("/home"); revalidatePath("/admin/components/promo-banners"); return NextResponse.json({ promoBanner: item }); }
  catch (err) { return NextResponse.json({ error: getPromoBannerErrorMessage(err) }, { status: 400 }); }
}
export async function PATCH(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.action !== "disable_modal") return NextResponse.json({ error: "Acción no válida" }, { status: 400 });

  try {
    const result = await deactivatePromoBannerModal();
    invalidatePublicContentCache();
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/components/promo-banners");
    return NextResponse.json({
      disabledCount: result.changedCount,
      message: result.changedCount > 0
        ? "Modal de inicio desactivado."
        : "El modal de inicio ya estaba desactivado.",
    });
  } catch (err) {
    return NextResponse.json({ error: getPromoBannerErrorMessage(err) }, { status: 400 });
  }
}
