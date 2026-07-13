"use client";

import { useRouter } from "next/navigation";
import type { Form } from "@/lib/cms/types";

const typeLabels: Record<string, string> = { contact: "Contacto", newsletter: "Newsletter", landing: "Landing", workshop: "Taller", gift_card: "Gift Card", private_booking: "Reserva privada", custom: "Custom" };

export default function FormsTable({ items }: { items: Form[] }) {
  const router = useRouter();
  async function run(id: string, action: string) {
    const r = await fetch(`/api/admin/formularios/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    if (r.ok) router.refresh();
  }
  return (<div className="table-card"><table className="admin-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Campos</th><th>Slug</th><th>Actualizado</th><th>Acciones</th></tr></thead><tbody>{items.map((f) => (<tr key={f.id}><td><strong>{f.name}</strong></td><td><span className="entity-badge">{typeLabels[f.type]}</span></td><td>{f.status}</td><td>{f.fields.length}</td><td>/{f.slug}</td><td>{new Date(f.updated_at).toLocaleString()}</td><td><div className="row-actions"><a className="link-btn" href={`/admin/formularios/${f.id}/edit`}>Editar</a><button className="secondary-btn" onClick={() => run(f.id, "duplicate")}>Duplicar</button>{f.status === "active" ? <button className="secondary-btn" onClick={() => run(f.id, "draft")}>Desactivar</button> : <button className="secondary-btn" onClick={() => run(f.id, "activate")}>Activar</button>}<button className="danger-btn" onClick={() => run(f.id, "trash")}>Papelera</button></div></td></tr>))}</tbody></table></div>);
}
