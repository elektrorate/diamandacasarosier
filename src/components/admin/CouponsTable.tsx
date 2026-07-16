"use client";

import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/cms/types";
import { formatAdminDate } from "@/lib/admin/date-format";

export default function CouponsTable({ items }: { items: Coupon[] }) {
  const router = useRouter();
  async function run(id: string, action: string) { const r = await fetch(`/api/admin/shop/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); if (r.ok) router.refresh(); }
  return (<div className="table-card"><table className="admin-table"><thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Estado</th><th>Usos</th><th>Límite</th><th>Válido desde</th><th>Válido hasta</th><th>Acciones</th></tr></thead><tbody>{items.map((c) => (<tr key={c.id}><td><strong style={{ fontFamily: "monospace" }}>{c.code}</strong></td><td>{c.discount_type === "percentage" ? "%" : "€"}</td><td style={{ fontWeight: 600 }}>{c.discount_type === "percentage" ? `${c.value}%` : `${c.value} €`}</td><td>{c.status}</td><td>{c.used_count}</td><td>{c.usage_limit ?? "∞"}</td><td className="muted">{c.start_date ? formatAdminDate(c.start_date) : "—"}</td><td className="muted">{c.end_date ? formatAdminDate(c.end_date) : "—"}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/shop/coupons/${c.id}/edit`}>Editar</a><button className="secondary-btn" onClick={() => run(c.id, "duplicate")}>Duplicar</button>{c.status === "active" ? <button className="secondary-btn" onClick={() => run(c.id, "deactivate")}>Desactivar</button> : <button className="secondary-btn" onClick={() => run(c.id, "activate")}>Activar</button>}<button className="danger-btn" onClick={() => run(c.id, "trash")}>Papelera</button></div></td></tr>))}</tbody></table></div>);
}
