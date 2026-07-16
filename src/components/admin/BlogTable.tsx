"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlogPost } from "@/lib/cms/types";
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

function statusLabel(status: BlogPost["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  if (status === "archived") return "Archivado";
  return status;
}

function actionMessage(action: string) {
  if (action === "edit") return "Abriendo edición de la bitácora.";
  if (action === "duplicate") return "Duplicado exitosamente.";
  if (action === "publish") return "Publicado exitosamente.";
  if (action === "draft") return "Borrador guardado correctamente.";
  if (action === "archive") return "Archivado exitosamente.";
  if (action === "feature") return "Bitácora agregada a destacados correctamente.";
  if (action === "unfeature") return "Bitácora retirada de destacados correctamente.";
  if (action === "trash") return "Movido a papelera exitosamente.";
  return "Acción completada correctamente.";
}

export default function BlogTable({
  items,
  showDuplicate = true,
  showArchive = true,
}: {
  items: BlogPost[];
  showDuplicate?: boolean;
  showArchive?: boolean;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  function actionKey(id: string, action: string) {
    return `${id}:${action}`;
  }

  function startEdit(id: string) {
    setPendingAction(actionKey(id, "edit"));
    setNotice({ type: "info", title: "Abriendo edición", message: actionMessage("edit") });
  }

  async function run(id: string, action: string) {
    if (pendingAction) return;

    setNotice(null);
    setPendingAction(actionKey(id, action));

    try {
      const response = await fetch(`/api/admin/bitacora/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setNotice({ type: "success", title: "Acción completada", message: actionMessage(action) });
        router.refresh();
        return;
      }

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setNotice({ type: "error", title: "No se pudo completar", message: data.error || "No se pudo completar la acción." });
    } catch {
      setNotice({ type: "error", title: "No se pudo conectar", message: "Revisa la conexión y vuelve a intentarlo." });
    } finally {
      setPendingAction(null);
    }
  }

  function isPending(id: string, action?: string) {
    if (!pendingAction) return false;
    return action ? pendingAction === actionKey(id, action) : pendingAction.startsWith(`${id}:`);
  }

  return (
    <>
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Destacado</th>
              <th>Orden</th>
              <th>Bloques</th>
              <th>Lectura</th>
              <th>Actualizado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => {
              const rowPending = isPending(post.id);
              return (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <br />
                    <span className="muted">{post.excerpt}</span>
                  </td>
                  <td>
                    <span className="entity-badge">{post.category}</span>
                  </td>
                  <td>{statusLabel(post.status)}</td>
                  <td>{post.is_featured ? <span className="entity-badge">Sí ({post.featured_order})</span> : "No"}</td>
                  <td>{post.sort_order}</td>
                  <td>{post.blocks.length}</td>
                  <td>{post.reading_time} min</td>
                  <td>{formatAdminDateTime(post.updated_at)}</td>
                  <td>
                    <div className="row-actions">
                      <Link
                        className={`link-btn ${rowPending ? "pointer-events-none opacity-50" : ""}`}
                        href={`/admin/bitacora/${post.id}/edit`}
                        aria-disabled={rowPending}
                        onClick={() => startEdit(post.id)}
                      >
                        {isPending(post.id, "edit") ? "Abriendo..." : "Editar"}
                      </Link>
                      {showDuplicate ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(post.id, "duplicate")}>
                          {isPending(post.id, "duplicate") ? "Duplicando..." : "Duplicar"}
                        </button>
                      ) : null}
                      {post.status === "published" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(post.id, "draft")}>
                          {isPending(post.id, "draft") ? "Guardando..." : "Borrador"}
                        </button>
                      ) : post.status !== "archived" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(post.id, "publish")}>
                          {isPending(post.id, "publish") ? "Publicando..." : "Publicar"}
                        </button>
                      ) : null}
                      {showArchive && post.status !== "archived" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(post.id, "archive")}>
                          {isPending(post.id, "archive") ? "Archivando..." : "Archivar"}
                        </button>
                      ) : null}
                      <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(post.id, post.is_featured ? "unfeature" : "feature")}>
                        {isPending(post.id, post.is_featured ? "unfeature" : "feature") ? "Guardando..." : post.is_featured ? "Quitar destacado" : "Destacar"}
                      </button>
                      <button
                        className="danger-btn"
                        type="button"
                        disabled={rowPending}
                        onClick={() => setConfirm({
                          id: post.id,
                          action: "trash",
                          title: "Mover a papelera",
                          message: `Se moverá "${post.title}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                          confirmLabel: "Papelera",
                        })}
                      >
                        {isPending(post.id, "trash") ? "Enviando..." : "Papelera"}
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
