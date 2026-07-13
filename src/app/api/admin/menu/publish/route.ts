import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { saveMenuItemsTree, type MenuItemTreeInput } from "@/lib/cms/menus";
import { invalidatePublicNavigationCache } from "@/lib/cms/navigation-public";
import { updateSettings } from "@/lib/cms/settings";
import type { SiteSettings } from "@/lib/cms/settings";

type PublishMenuRequest = {
  menuId?: string;
  settings?: Partial<SiteSettings>;
  items?: MenuItemTreeInput[];
};

export async function PUT(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as PublishMenuRequest;
  const menuId = typeof body.menuId === "string" ? body.menuId.trim() : "";
  if (!menuId) return NextResponse.json({ error: "menuId es obligatorio." }, { status: 400 });
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "items es obligatorio." }, { status: 400 });
  }

  try {
    const [, items] = await Promise.all([
      body.settings ? updateSettings(body.settings) : Promise.resolve(null),
      saveMenuItemsTree(menuId, body.items),
    ]);

    if (!items) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });

    invalidatePublicNavigationCache();
    revalidatePath("/", "layout");
    revalidatePath("/admin/menu");

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al publicar menú" },
      { status: 400 },
    );
  }
}
