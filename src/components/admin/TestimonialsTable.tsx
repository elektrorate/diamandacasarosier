"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Testimonial, TestimonialStatus } from "@/lib/cms/types";
import AdminActionModal from "./AdminActionModal";

type Notice = { type: "success" | "error"; title: string; message: string };
type ConfirmAction = { id: string; action: "trash"; title: string; message: string; confirmLabel: string };
type TestimonialFilter = { value: "all" | "draft" | "published"; label: string; href: string };

const statusLabels: Record<TestimonialStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  deleted: "Eliminado",
};

function actionMessage(action: string) {
  if (action === "publish") return "Publicado exitosamente.";
  if (action === "draft") return "Borrador guardado correctamente.";
  if (action === "trash") return "Movido a papelera exitosamente.";
  return "Cambio aplicado correctamente.";
}

function ordered(items: Testimonial[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || +new Date(b.updated_at) - +new Date(a.updated_at));
}

export default function TestimonialsTable({
  items,
  filters,
  status,
}: {
  items: Testimonial[];
  filters: readonly TestimonialFilter[];
  status: TestimonialFilter["value"];
}) {
  const router = useRouter();
  const initialIds = useMemo(() => ordered(items).map((item) => item.id).join("|"), [items]);
  const [orderedItems, setOrderedItems] = useState<Testimonial[]>(() => ordered(items));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (!notice || notice.type === "success") return;
    const timer = window.setTimeout(() => setNotice(null), 3800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const currentIds = orderedItems.map((item) => item.id).join("|");
  const hasOrderChanges = currentIds !== initialIds;

  function actionKey(id: string, action: string) {
    return `${id}:${action}`;
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= orderedItems.length || fromIndex === toIndex) return;
    setOrderedItems((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((item, index) => ({ ...item, sort_order: index }));
    });
  }

  function moveById(id: string, toIndex: number) {
    const fromIndex = orderedItems.findIndex((item) => item.id === id);
    moveItem(fromIndex, toIndex);
  }

  async function saveOrder() {
    if (!hasOrderChanges || isSavingOrder) return;
    setNotice(null);
    setIsSavingOrder(true);
    try {
      const response = await fetch("/api/admin/components/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds: orderedItems.map((item) => item.id) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "No se pudo guardar el orden." }));
        setNotice({
          type: "error",
          title: "No se pudo completar",
          message: (data as { error?: string }).error || "No se pudo guardar el orden.",
        });
        return;
      }
      setNotice({ type: "success", title: "Acción completada", message: "Orden guardado correctamente." });
      router.refresh();
    } catch {
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function run(id: string, action: string) {
    if (pendingAction || isSavingOrder) return;
    setNotice(null);
    setPendingAction(actionKey(id, action));
    try {
      const response = await fetch(`/api/admin/components/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        setNotice({ type: "success", title: "Acción completada", message: actionMessage(action) });
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({ error: "No se pudo completar la acción." }));
      setNotice({
        type: "error",
        title: "No se pudo completar",
        message: (data as { error?: string }).error || "No se pudo completar la acción.",
      });
    } catch {
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="testimonial-admin-view">
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Testimonios</h2>
          <p className="muted">Administra las reseñas visibles en la página principal.</p>
        </div>
        <div className="row-actions testimonial-admin-actions">
          <Link className="primary-btn inline" href="/admin/components/testimonials/new">
            Crear testimonio
          </Link>
          <button className="primary-btn" type="button" onClick={saveOrder} disabled={!hasOrderChanges || isSavingOrder}>
            {isSavingOrder ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
      <div className="filters">
        <div className="filter-group" aria-label="Filtrar testimonios por estado">
          {filters.map((filter) => (
            <Link key={filter.value} className={filter.value === status ? "chip active" : "chip"} href={filter.href}>
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card-list testimonial-card-list">
      {!orderedItems.length ? (
        <div className="empty-state">
          <h3>Aún no hay testimonios</h3>
          <p className="muted">Crea el primer testimonio.</p>
          <Link className="primary-btn inline" href="/admin/components/testimonials/new">
            Crear testimonio
          </Link>
        </div>
      ) : null}

      {orderedItems.map((testimonial, index) => {
        const isPending = pendingAction?.startsWith(`${testimonial.id}:`);
        return (
          <article
            key={testimonial.id}
            className={`admin-list-card testimonial-admin-card${draggedId === testimonial.id ? " is-dragging" : ""}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              setDraggedId(testimonial.id);
            }}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggedId) return;
              moveById(draggedId, index);
              setDraggedId(null);
            }}
          >
            <div className="testimonial-admin-card__avatar">
              {testimonial.avatar_id ? (
                <img src={testimonial.avatar_id} alt={`Foto de ${testimonial.name}`} />
              ) : (
                <span>{testimonial.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="admin-list-card__body">
              <div className="admin-list-card__head">
                <div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.role || "Sin rol definido"}</p>
                </div>
                <div className="badge-stack">
                  <span className={`status-pill status-pill--${testimonial.status}`}>
                    {statusLabels[testimonial.status]}
                  </span>
                </div>
              </div>
              <p className="admin-list-card__copy">
                {testimonial.text || "Este testimonio aún no tiene texto."}
              </p>
              <div className="admin-list-card__meta">
                <span>Orden {index + 1}</span>
                <span>Actualizado {new Date(testimonial.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="row-actions admin-list-card__actions">
                <button
                  type="button"
                  className="secondary-btn icon-btn"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0 || isSavingOrder}
                  aria-label="Subir testimonio"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  className="secondary-btn icon-btn"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === orderedItems.length - 1 || isSavingOrder}
                  aria-label="Bajar testimonio"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                </button>
                <a className="link-btn" href={`/admin/components/testimonials/${testimonial.id}/edit`}>
                  Editar
                </a>
                {testimonial.status === "published" ? (
                  <button className="secondary-btn" type="button" onClick={() => run(testimonial.id, "draft")} disabled={isPending}>
                    Borrador
                  </button>
                ) : (
                  <button className="secondary-btn" type="button" onClick={() => run(testimonial.id, "publish")} disabled={isPending}>
                    Publicar
                  </button>
                )}
                <button
                  className="danger-btn"
                  type="button"
                  onClick={() => setConfirm({
                    id: testimonial.id,
                    action: "trash",
                    title: "Mover a papelera",
                    message: `Se moverá "${testimonial.name}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                    confirmLabel: "Mover a papelera",
                  })}
                  disabled={isPending}
                >
                  Papelera
                </button>
              </div>
            </div>
          </article>
        );
      })}
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
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (confirm) void run(confirm.id, confirm.action);
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
