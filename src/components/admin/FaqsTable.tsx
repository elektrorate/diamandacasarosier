"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Faq, FaqGroup } from "@/lib/cms/types";

type Toast = { type: "success" | "error"; message: string };

const statusLabels: Record<Faq["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  deleted: "Eliminado",
};

export default function FaqsTable({ items, groups }: { items: Faq[]; groups: FaqGroup[] }) {
  const router = useRouter();
  const groupTitleById = useMemo(() => new Map(groups.map((group) => [group.id, group.title])), [groups]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function message(action: string) {
    if (action === "duplicate") return "FAQ duplicada correctamente.";
    if (action === "publish") return "FAQ publicada correctamente.";
    if (action === "draft") return "FAQ pasada a borrador correctamente.";
    if (action === "trash") return "FAQ enviada a la papelera correctamente.";
    return "Acción completada correctamente.";
  }

  async function run(id: string, action: string) {
    if (pendingAction) return;
    if (action === "trash" && !window.confirm("¿Mover esta FAQ a la papelera?")) return;
    setToast(null);
    setPendingAction(id + ":" + action);
    try {
      const response = await fetch("/api/admin/components/faqs/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        setToast({ type: "success", message: message(action) });
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({})) as { error?: string };
      setToast({ type: "error", message: data.error || "No se pudo completar la acción." });
    } catch {
      setToast({ type: "error", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {toast ? <div className={"admin-toast admin-toast--" + toast.type} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">{toast.message}</div> : null}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Grupo</th>
              <th>Subtema</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowPending = pendingAction?.startsWith(item.id + ":");
              return (
                <tr key={item.id}>
                  <td><strong>{item.question}</strong></td>
                  <td><span className="entity-badge">{item.faq_group_id ? groupTitleById.get(item.faq_group_id) ?? "Sin grupo" : "Sin grupo"}</span></td>
                  <td>{item.topic_title || "General"}</td>
                  <td>{item.sort_order}</td>
                  <td><span className={`status-pill status-pill--${item.status}`}>{statusLabels[item.status]}</span></td>
                  <td>
                    <div className="row-actions">
                      <a className="link-btn" href={"/admin/components/faqs/" + item.id + "/edit"}>Editar</a>
                      <button className="secondary-btn" disabled={rowPending} onClick={() => run(item.id, "duplicate")}>{pendingAction === item.id + ":duplicate" ? "Duplicando..." : "Duplicar"}</button>
                      {item.status === "published" ? (
                        <button className="secondary-btn" disabled={rowPending} onClick={() => run(item.id, "draft")}>
                          {pendingAction === item.id + ":draft" ? "Guardando..." : "Pasar a borrador"}
                        </button>
                      ) : item.status !== "archived" ? (
                        <button className="primary-btn" disabled={rowPending} onClick={() => run(item.id, "publish")}>
                          {pendingAction === item.id + ":publish" ? "Publicando..." : "Publicar"}
                        </button>
                      ) : null}
                      <button className="danger-btn" disabled={rowPending} onClick={() => run(item.id, "trash")}>Papelera</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
