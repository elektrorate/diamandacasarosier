import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteReservationPermanently, duplicateReservation, getReservationById, moveReservationToTrash, restoreReservation, updateReservation } from "@/lib/cms/reservations";

import { isReservationPaymentStatus, isReservationStatus } from "@/lib/cms/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getReservationById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ reservation: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateReservation((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ reservation: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "duplicate") { const item = await duplicateReservation(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ reservation: item }); }
  if (body.action === "trash") { const item = await moveReservationToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ reservation: item }); }
  if (body.action === "restore") { const item = await restoreReservation(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ reservation: item }); }
  const item = await getReservationById(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (body.action === "status" && isReservationStatus(body.status)) { const updated = await updateReservation(id, { status: body.status }); return NextResponse.json({ reservation: updated }); }
  if (body.action === "payment" && isReservationPaymentStatus(body.payment_status)) { const updated = await updateReservation(id, { payment_status: body.payment_status }); return NextResponse.json({ reservation: updated }); }
  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteReservationPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ ok: true });
}
