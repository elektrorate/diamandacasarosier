import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createOffering, getOfferings } from "@/lib/cms/offerings";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import type { Offering } from "@/lib/cms/types";

function publicOfferingPath(offering: Pick<Offering, "type" | "slug"> | null | undefined) {
  if (!offering?.slug) return null;
  if (offering.type === "workshop") return `/workshops/${offering.slug}`;
  if (offering.type === "experience") return `/experiencias/${offering.slug}`;
  if (offering.type === "gift_card") return `/gift-cards/${offering.slug}`;
  return `/clases/${offering.slug}`;
}

function refreshOfferingPaths(offering?: Pick<Offering, "type" | "slug"> | null) {
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
  const path = publicOfferingPath(offering);
  if (path) revalidatePath(path);
}

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offerings = await getOfferings();
  return NextResponse.json({ offerings });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.title || !body?.type) {
    return NextResponse.json({ error: "El título y el tipo son obligatorios." }, { status: 400 });
  }

  try {
    const offering = await createOffering(body);
    refreshOfferingPaths(offering);
    return NextResponse.json({ offering });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear el offering" }, { status: 400 });
  }
}
