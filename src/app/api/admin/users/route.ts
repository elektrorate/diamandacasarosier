import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createCmsAdminUser, getCmsAdminUsers } from "@/lib/admin/users";

export async function GET() {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await getCmsAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar los usuarios." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      full_name?: string;
    };

    await createCmsAdminUser({
      email: body.email ?? "",
      password: body.password ?? "",
      full_name: body.full_name,
      actorEmail: session.userEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el usuario." },
      { status: 400 },
    );
  }
}
