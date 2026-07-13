"use client";

import { useRouter } from "next/navigation";
import type { Reservation } from "@/lib/cms/types";

const statusLabels: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", paid: "Pagada", cancelled: "Cancelada", rescheduled: "Reprogramada", deleted: "Eliminada" };
const payLabels: Record<string, string> = { unpaid: "Impago", pending: "Pendiente", paid: "Pagado", refunded: "Reembolsado", failed: "Fallido" };

export default function ReservationsTable({ items, offerings }: { items: Reservation[]; offerings: { id: string; title: string; type: string }[] }) {
  const router = useRouter();
  function getOfferingTitle(id: string) { return offerings.find((o) => o.id === id)?.title ?? id; }
  async function run(id: string, action: string, extra?: Record<string, string>) {
    const r = await fetch(`/api/admin/reservas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    if (r.ok) router.refresh();
  }
  return (<div className="table-card"><table className="admin-table"><thead><tr><th>Cliente</th><th>Actividad</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Estado</th><th>Pago</th><th>Total</th><th>Acciones</th></tr></thead><tbody>{items.map((i) => (<tr key={i.id}><td><strong>{i.customer_name}</strong><br /><span className="muted">{i.customer_email}</span></td><td>{getOfferingTitle(i.offering_id)}</td><td>{i.date}</td><td>{i.time}</td><td>{i.people_count}</td><td><select className="table-select" value={i.status} onChange={(e) => run(i.id, "status", { status: e.target.value })}>{Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td><td><select className="table-select" value={i.payment_status} onChange={(e) => run(i.id, "payment", { payment_status: e.target.value })}>{Object.entries(payLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td><td>{i.total_amount ? `${i.total_amount} ${i.currency}` : "—"}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/reservas/${i.id}/edit`}>Editar</a><button className="danger-btn" onClick={() => run(i.id, "trash")}>Papelera</button></div></td></tr>))}</tbody></table></div>);
}
