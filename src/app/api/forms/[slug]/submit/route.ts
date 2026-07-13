import { NextResponse, type NextRequest } from "next/server";
import { getFormBySlug } from "@/lib/cms/forms";
import { createFormSubmission } from "@/lib/cms/form-submissions";

export async function POST(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const form = await getFormBySlug((await ctx.params).slug);
  if (!form || form.status !== "active") return NextResponse.json({ error: "Formulario no encontrado o inactivo." }, { status: 404 });
  const body = await request.json();
  if (!body?.name || !body?.email) return NextResponse.json({ error: "Nombre y email obligatorios." }, { status: 400 });
  const submission = await createFormSubmission({
    form_id: form.id,
    form_slug: form.slug,
    form_name: form.name,
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    subject: body.subject || "",
    message: body.message || "",
    data: body.data || body,
    source_page: body.source_page || "",
    status: "new",
  });
  return NextResponse.json({ ok: true, message: form.success_message || "Mensaje enviado correctamente.", submission_id: submission.id });
}
