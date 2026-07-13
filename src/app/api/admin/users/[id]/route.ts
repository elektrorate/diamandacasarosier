import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteCmsAdminUser, updateCmsAdminUserPassword } from "@/lib/admin/users";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    await updateCmsAdminUserPassword(id, body.password ?? "", session.userEmail);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar la contraseña." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await ctx.params;
    await deleteCmsAdminUser(id, session.userEmail);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar el usuario." },
      { status: 400 },
    );
  }
}
