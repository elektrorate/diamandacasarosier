import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { createReservation, getReservations } from "@/lib/cms/reservations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const payment = request.nextUrl.searchParams.get("payment_status") || undefined;
  const date = request.nextUrl.searchParams.get("date") || undefined;
  let items = await getReservations();
  if (status) items = items.filter((x) => x.status === status);
  if (payment) items = items.filter((x) => x.payment_status === payment);
  if (date) items = items.filter((x) => x.date === date);
  return NextResponse.json({ reservations: items });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body?.customer_name) return NextResponse.json({ error: "El nombre del cliente es obligatorio." }, { status: 400 });
  try { const item = await createReservation(body); return NextResponse.json({ reservation: item }); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 }); }
}
