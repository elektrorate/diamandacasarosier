"use client";

import { useRouter } from "next/navigation";
import type { ProductCategory } from "@/lib/cms/types";

export default function CategoriesTable({ items }: { items: ProductCategory[] }) {
  const router = useRouter();
  async function run(id: string, action: string) { const r = await fetch(`/api/admin/shop/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); if (r.ok) router.refresh(); }
  return (<div className="table-card"><table className="admin-table"><thead><tr><th>Nombre</th><th>Slug</th><th>Estado</th><th>Orden</th><th>Productos</th><th>Acciones</th></tr></thead><tbody>{items.map((c) => (<tr key={c.id}><td><strong>{c.name}</strong></td><td className="muted">/{c.slug}</td><td>{c.status}</td><td>{c.sort_order}</td><td>—</td><td><div className="row-actions"><a className="link-btn" href={`/admin/shop/categories/${c.id}/edit`}>Editar</a><button className="danger-btn" onClick={() => run(c.id, "trash")}>Papelera</button></div></td></tr>))}</tbody></table></div>);
}
