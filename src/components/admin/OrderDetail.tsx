"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order } from "@/lib/cms/types";
import { ORDER_STATUSES } from "@/lib/cms/types";

const stLabels: Record<string, string> = { new: "Nuevo", paid: "Pagado", preparing: "Preparando", shipped: "Enviado", completed: "Completado", cancelled: "Cancelado" };

export default function OrderDetail({ item }: { item: Order }) {
  const router = useRouter();
  const [notes, setNotes] = useState(item.internal_notes);
  async function run(action: string, extra?: Record<string, string>) {
    const r = await fetch(`/api/admin/shop/orders/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    if (r.ok) router.refresh();
  }
  async function saveNotes() { await fetch(`/api/admin/shop/orders/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ internal_notes: notes }) }); router.refresh(); }

  return (
    <div className="page-card">
      <div className="page-header"><h2>Pedido #{item.id.slice(0, 8)}</h2><Link className="secondary-btn" href="/admin/shop/orders">Volver</Link></div>
      <div className="header-form-layout">
        <div className="menu-form-main">
          <div className="form-block"><h3>Cliente</h3><div className="grid-2">
            <div><p className="auth-kicker">Nombre</p><p style={{ fontWeight: 500 }}>{item.customer_name}</p></div>
            <div><p className="auth-kicker">Email</p><p><a href={`mailto:${item.customer_email}`}>{item.customer_email}</a></p></div>
            {item.customer_phone ? <div><p className="auth-kicker">Teléfono</p><p>{item.customer_phone}</p></div> : null}
            <div><p className="auth-kicker">Fecha</p><p>{new Date(item.created_at).toLocaleString()}</p></div>
          </div></div>

          <div className="form-block"><h3>Estado</h3><div className="grid-2">
            <label className="field"><span>Estado del pedido</span><select value={item.status} onChange={(e) => run("status", { status: e.target.value })}>{ORDER_STATUSES.filter((s) => s !== "deleted").map((s) => <option key={s} value={s}>{stLabels[s] || s}</option>)}</select></label>
            <label className="field"><span>Estado del pago</span><select value={item.payment_status} onChange={(e) => run("payment", { payment_status: e.target.value })}><option value="unpaid">Impago</option><option value="pending">Pendiente</option><option value="paid">Pagado</option><option value="refunded">Reembolsado</option><option value="failed">Fallido</option></select></label>
          </div></div>

          {item.shipping_address ? <div className="form-block"><h3>Dirección de envío</h3><p style={{ whiteSpace: "pre-wrap" }}>{item.shipping_address}</p></div> : null}

          <div className="form-block"><h3>Productos ({item.items.length})</h3>
            <table className="admin-table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio ud.</th><th>Total</th></tr></thead><tbody>{item.items.map((i) => (<tr key={i.id}><td>{i.product_name}</td><td>{i.quantity}</td><td>{i.unit_price} €</td><td style={{ fontWeight: 600 }}>{i.total} €</td></tr>))}</tbody></table>
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <p>Subtotal: <strong>{item.subtotal ?? 0} €</strong></p>
              {item.discount_total ? <p>Descuento: <strong>-{item.discount_total} €</strong></p> : null}
              {item.shipping_total ? <p>Envío: <strong>{item.shipping_total} €</strong></p> : null}
              <p style={{ fontSize: "1.1rem" }}>Total: <strong>{item.total ?? 0} €</strong></p>
            </div>
          </div>

          {item.coupon_code ? <div className="form-block"><p>Cupón aplicado: <strong>{item.coupon_code}</strong></p></div> : null}
          {item.payment_method ? <div className="form-block"><p>Método de pago: <strong>{item.payment_method}</strong></p></div> : null}

          <div className="form-block"><h3>Notas internas</h3><textarea rows={4} style={{ width: "100%" }} value={notes} onChange={(e) => setNotes(e.target.value)} /><div style={{ marginTop: "0.5rem" }}><button className="primary-btn" onClick={saveNotes}>Guardar notas</button></div></div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button className="danger-btn" onClick={() => run("trash")}>Papelera</button>
          </div>
        </div>
      </div>
    </div>
  );
}
