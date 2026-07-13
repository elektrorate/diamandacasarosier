import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createOrder, getOrders } from "@/lib/cms/orders";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const payment = request.nextUrl.searchParams.get("payment_status") || undefined;
  const date = request.nextUrl.searchParams.get("date") || undefined;
  let items = await getOrders();
  if (status) items = items.filter((x) => x.status === status);
  if (payment) items = items.filter((x) => x.payment_status === payment);
  if (date) items = items.filter((x) => x.created_at.startsWith(date));
  return NextResponse.json({ orders: items });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  try { const item = await createOrder(body); return NextResponse.json({ order: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
