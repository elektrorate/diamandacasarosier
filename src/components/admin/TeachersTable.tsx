"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Teacher } from "@/lib/cms/types";
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

function statusLabel(status: Teacher["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  if (status === "archived") return "Archivado";
  return status;
}

function actionMessage(action: string) {
  if (action === "edit") return "Abriendo edición del especialista.";
  if (action === "duplicate") return "Duplicado exitosamente.";
  if (action === "publish") return "Publicado exitosamente.";
  if (action === "draft") return "Borrador guardado correctamente.";
  if (action === "archive") return "Archivado exitosamente.";
  if (action === "trash") return "Movido a papelera exitosamente.";
  return "Acción completada correctamente.";
}

export default function TeachersTable({
  items,
  basePath = "/admin/components/teachers",
  showDuplicate = true,
  showArchive = true,
}: {
  items: Teacher[];
  basePath?: string;
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
      const response = await fetch(`/api/admin/components/teachers/${id}`, {
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
              <th>Nombre</th>
              <th>Subtítulo</th>
              <th>Estado</th>
              <th>Orden</th>
              <th>Instagram</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowPending = isPending(item.id);
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <br />
                    <span className="muted">
                      {item.bio.slice(0, 110)}
                      {item.bio.length > 110 ? "..." : ""}
                    </span>
                  </td>
                  <td>{item.specialty || "—"}</td>
                  <td>{statusLabel(item.status)}</td>
                  <td>{item.sort_order}</td>
                  <td>{item.instagram || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <Link
                        className={`link-btn ${rowPending ? "pointer-events-none opacity-50" : ""}`}
                        href={`${basePath}/${item.id}/edit`}
                        aria-disabled={rowPending}
                        onClick={() => startEdit(item.id)}
                      >
                        {isPending(item.id, "edit") ? "Abriendo..." : "Editar"}
                      </Link>
                      {showDuplicate ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(item.id, "duplicate")}>
                          {isPending(item.id, "duplicate") ? "Duplicando..." : "Duplicar"}
                        </button>
                      ) : null}
                      {item.status === "published" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(item.id, "draft")}>
                          {isPending(item.id, "draft") ? "Guardando..." : "Borrador"}
                        </button>
                      ) : item.status !== "archived" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(item.id, "publish")}>
                          {isPending(item.id, "publish") ? "Publicando..." : "Publicar"}
                        </button>
                      ) : null}
                      {showArchive && item.status !== "archived" ? (
                        <button className="secondary-btn" type="button" disabled={rowPending} onClick={() => run(item.id, "archive")}>
                          {isPending(item.id, "archive") ? "Archivando..." : "Archivar"}
                        </button>
                      ) : null}
                      <button
                        className="danger-btn"
                        type="button"
                        disabled={rowPending}
                        onClick={() => setConfirm({
                          id: item.id,
                          action: "trash",
                          title: "Mover a papelera",
                          message: `Se moverá "${item.name}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                          confirmLabel: "Papelera",
                        })}
                      >
                        {isPending(item.id, "trash") ? "Enviando..." : "Papelera"}
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
