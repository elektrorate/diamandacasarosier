import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { deleteOrderPermanently, getOrderById, moveOrderToTrash, restoreOrder, updateOrder } from "@/lib/cms/orders";

import { isOrderPaymentStatus, isOrderStatus } from "@/lib/cms/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await getOrderById((await ctx.params).id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ order: item });
}
export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const item = await updateOrder((await ctx.params).id, await request.json()); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ order: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params; const body = await request.json().catch(() => ({}));
  if (body.action === "trash") { const item = await moveOrderToTrash(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ order: item }); }
  if (body.action === "restore") { const item = await restoreOrder(id); if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ order: item }); }
  if (body.action === "status" && isOrderStatus(body.status)) { const u = await updateOrder(id, { status: body.status }); return NextResponse.json({ order: u }); }
  if (body.action === "payment" && isOrderPaymentStatus(body.payment_status)) { const u = await updateOrder(id, { payment_status: body.payment_status }); return NextResponse.json({ order: u }); }
  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteOrderPermanently((await ctx.params).id); if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 }); return NextResponse.json({ ok: true });
}
