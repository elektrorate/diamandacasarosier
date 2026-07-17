"use client";

import Image from "next/image";
import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlogPost } from "@/lib/cms/types";
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

function cleanListingText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~]/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function listingExcerpt(post: BlogPost) {
  const blockContent = post.blocks
    .filter((block) => block.is_visible)
    .map((block) => [block.title, block.text, block.custom_html].filter(Boolean).join(" "))
    .join(" ");
  const clean = cleanListingText(post.listing_excerpt || blockContent || post.content || post.excerpt);
  const words = clean.split(/\s+/).filter(Boolean);
  return `${words.slice(0, 10).join(" ")}${words.length > 10 ? "..." : ""}`;
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
      <div className="table-card blog-table-card">
        <table className="admin-table blog-admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Acciones</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => {
              const rowPending = isPending(post.id);
              return (
                <tr key={post.id}>
                  <td>
                    <div className="flex min-w-[280px] items-center gap-3">
                      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
                        {post.featured_image_id ? (
                          <Image src={post.featured_image_id} alt="" fill sizes="60px" className="object-cover" unoptimized />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-on-surface-variant" aria-hidden="true">
                            <span className="material-symbols-outlined">image</span>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link className="font-bold text-on-surface hover:text-secondary" href={`/admin/bitacora/${post.id}/edit`} onClick={() => startEdit(post.id)}>
                          {post.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 max-w-[420px] text-sm leading-5 text-on-surface-variant">
                          {listingExcerpt(post) || "Sin extracto."}
                        </p>
                      </div>
                    </div>
                  </td>
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
                  <td>
                    <span className="entity-badge">{post.category}</span>
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
