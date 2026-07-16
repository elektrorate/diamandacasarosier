"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, ProductCategory } from "@/lib/cms/types";
import { formatAdminDateTime } from "@/lib/admin/date-format";
import AdminActionModal from "./AdminActionModal";

type Notice = {
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

type ConfirmAction = {
  id: string;
  action: string;
  title: string;
  message: string;
  confirmLabel: string;
};

export default function ProductsTable({ items, categories }: { items: Product[]; categories: ProductCategory[] }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  function catName(id: string) { return categories.find((c) => c.id === id)?.name ?? id; }
  function message(action: string) {
    if (action === "publish") return "Publicado exitosamente.";
    if (action === "draft") return "Borrador guardado correctamente.";
    if (action === "trash") return "Movido a papelera exitosamente.";
    return "Acción completada correctamente.";
  }
  async function run(id: string, action: string) {
    if (pendingAction) return;
    setNotice(null);
    setPendingAction(`${id}:${action}`);
    try {
      const r = await fetch(`/api/admin/shop/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.ok) {
        setNotice({ type: "success", title: "Acción completada", message: message(action) });
        router.refresh();
        return;
      }
      const data = await r.json().catch(() => ({})) as { error?: string };
      setNotice({ type: "error", title: "No se pudo completar", message: data.error || "No se pudo completar la acción." });
    } catch {
      setNotice({ type: "error", title: "No se pudo conectar", message: "Revisa la conexión y vuelve a intentarlo." });
    } finally {
      setPendingAction(null);
    }
  }
  return (
    <>
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Actualizado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const rowPending = pendingAction?.startsWith(`${p.id}:`);
              const isPublished = p.status === "published";
              return (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{p.sku || "—"}</td>
                  <td><span className="entity-badge">{catName(p.category_id) || "—"}</span></td>
                  <td>{p.price !== null ? `${p.price} €` : "—"}</td>
                  <td style={p.stock !== null && p.stock <= p.low_stock_threshold ? { color: "var(--danger)", fontWeight: 600 } : undefined}>
                    {p.stock !== null ? p.stock : "∞"}
                  </td>
                  <td>{formatAdminDateTime(p.updated_at)}</td>
                  <td>
                    <div className="row-actions">
                      <a className="link-btn" href={`/admin/shop/products/${p.id}/edit`}>Editar</a>
                      {isPublished ? (
                        <button className="secondary-btn" disabled={rowPending} onClick={() => run(p.id, "draft")}>
                          {pendingAction === `${p.id}:draft` ? "Guardando..." : "Borrador"}
                        </button>
                      ) : (
                        <button className="primary-btn shop-products-table__publish" disabled={rowPending} onClick={() => run(p.id, "publish")}>
                          {pendingAction === `${p.id}:publish` ? "Publicando..." : "Publicar"}
                        </button>
                      )}
                      <button
                        className="danger-btn"
                        disabled={rowPending}
                        onClick={() => setConfirm({
                          id: p.id,
                          action: "trash",
                          title: "Mover a papelera",
                          message: `Se moverá "${p.name}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                          confirmLabel: "Papelera",
                        })}
                      >
                        Papelera
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AdminActionModal
        open={Boolean(notice)}
        type={notice?.type}
        title={notice?.title ?? ""}
        message={notice?.message}
        confirmLabel="Entendido"
        onClose={() => setNotice(null)}
      />
      <AdminActionModal
        open={Boolean(confirm)}
        type="confirm"
        title={confirm?.title ?? ""}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => {
          if (confirm) void run(confirm.id, confirm.action);
        }}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
