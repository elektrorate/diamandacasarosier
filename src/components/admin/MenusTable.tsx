"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Menu } from "@/lib/cms/types";

const locLabels: Record<string, string> = { main: "Principal", mobile: "Móvil", footer: "Footer" };
type Toast = { type: "success" | "error"; message: string };

export default function MenusTable({ menus }: { menus: Menu[] }) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function message(action: string) {
    if (action === "duplicate") return "Menu duplicado correctamente.";
    if (action === "activate") return "Menu activado correctamente.";
    if (action === "draft") return "Menu pasado a borrador correctamente.";
    if (action === "archive") return "Menu archivado correctamente.";
    if (action === "trash") return "Menu enviado a la papelera correctamente.";
    return "Accion completada correctamente.";
  }

  async function runAction(id: string, action: string) {
    if (pendingAction) return;
    if (action === "trash" && !window.confirm("¿Mover este menu a la papelera?")) return;
    setToast(null);
    setPendingAction(`${id}:${action}`);
    try {
      const res = await fetch(`/api/admin/menus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) { setToast({ type: "success", message: message(action) }); router.refresh(); return; }
      const data = await res.json().catch(() => ({})) as { error?: string };
      setToast({ type: "error", message: data.error || "No se pudo completar la accion." });
    } catch {
      setToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {toast ? <div className={`admin-toast admin-toast--${toast.type}`} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">{toast.message}</div> : null}
    <div className="table-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Items</th>
            <th>Actualizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => {
            const rowPending = pendingAction?.startsWith(`${menu.id}:`);
            return (
            <tr key={menu.id}>
              <td><strong>{menu.name}</strong></td>
              <td><span className="entity-badge">{locLabels[menu.location] || menu.location}</span></td>
              <td>{menu.status}</td>
              <td>{menu.items.length}</td>
              <td>{new Date(menu.updated_at).toLocaleString()}</td>
              <td>
                <div className="row-actions">
                  <a className="link-btn" href={`/admin/menu/${menu.id}/edit`}>Editar</a>
                  <button className="secondary-btn" disabled={rowPending} onClick={() => runAction(menu.id, "duplicate")}>{pendingAction === `${menu.id}:duplicate` ? "Duplicando..." : "Duplicar"}</button>
                  {menu.status === "active" ? (
                    <button className="secondary-btn" disabled={rowPending} onClick={() => runAction(menu.id, "draft")}>Borrador</button>
                  ) : (
                    <button className="secondary-btn" disabled={rowPending} onClick={() => runAction(menu.id, "activate")}>Activar</button>
                  )}
                  <button className="secondary-btn" disabled={rowPending} onClick={() => runAction(menu.id, "archive")}>Archivar</button>
                  <button className="danger-btn" disabled={rowPending} onClick={() => runAction(menu.id, "trash")}>Papelera</button>
                </div>
              </td>
            </tr>
          ); })}
        </tbody>
      </table>
    </div>
    </div>
  );
}
