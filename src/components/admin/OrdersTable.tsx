"use client";

import { useRouter } from "next/navigation";
import type { Order } from "@/lib/cms/types";
import { formatAdminDateTime } from "@/lib/admin/date-format";

const stLabels: Record<string, string> = { new: "Nuevo", paid: "Pagado", preparing: "Preparando", shipped: "Enviado", completed: "Completado", cancelled: "Cancelado" };

export default function OrdersTable({ items }: { items: Order[] }) {
  const router = useRouter();
  async function run(id: string, action: string, extra?: Record<string, string>) {
    const r = await fetch(`/api/admin/shop/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    if (r.ok) router.refresh();
  }
  return (<div className="table-card"><table className="admin-table"><thead><tr><th>Cliente</th><th>Email</th><th>Estado</th><th>Pago</th><th>Total</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>{items.map((o) => (<tr key={o.id}><td><strong>{o.customer_name}</strong></td><td className="muted">{o.customer_email}</td><td><select className="table-select" value={o.status} onChange={(e) => run(o.id, "status", { status: e.target.value })}>{Object.entries(stLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}<option value="cancelled">Cancelado</option></select></td><td>{o.payment_status}</td><td style={{ fontWeight: 600 }}>{o.total !== null ? `${o.total} €` : "—"}</td><td>{formatAdminDateTime(o.created_at)}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/shop/orders/${o.id}`}>Ver</a><button className="danger-btn" onClick={() => run(o.id, "trash")}>Papelera</button></div></td></tr>))}</tbody></table></div>);
}
