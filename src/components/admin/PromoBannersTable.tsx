"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminActionModal from "./AdminActionModal";
import type { PromoBanner, PromoStatus } from "@/lib/cms/types";

const statusLabels: Record<PromoStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  deleted: "Eliminado",
};

type Notice = {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  details?: string[];
};

type ConfirmAction = {
  id: string;
  action: string;
  title: string;
  message: string;
  confirmLabel: string;
};

function stripMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .trim();
}

function getVisibilityState(banner: PromoBanner) {
  if (banner.status !== "published") {
    return {
      tone: "idle",
      label: "Inactivo",
      message: "No se muestra en el home.",
      canShowNow: false,
    };
  }

  return {
    tone: "success",
    label: "Activo ahora",
    message: "Este es el único banner visible en el home.",
    canShowNow: true,
  };
}

export default function PromoBannersTable({
  items,
  activeBanner,
}: {
  items: PromoBanner[];
  activeBanner: PromoBanner | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  async function disableModal() {
    setPending("modal:disable");
    setNotice(null);

    try {
      const response = await fetch("/api/admin/components/promo-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable_modal" }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          type: "error",
          title: "No se pudo desactivar",
          message: typeof data.error === "string" ? data.error : "Intenta nuevamente.",
        });
        return;
      }

      setNotice({
        type: "success",
        title: "Modal desactivado",
        message: typeof data.message === "string" ? data.message : "No se mostrará ningún banner al entrar al home.",
      });
      router.refresh();
    } catch {
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "Revisa la conexión y vuelve a intentarlo.",
      });
    } finally {
      setPending(null);
    }
  }
  async function run(id: string, action: string) {
    const pendingKey = `${id}:${action}`;
    const shouldHideOptimistically = action === "trash";
    setPending(pendingKey);
    setNotice(null);
    if (shouldHideOptimistically) {
      setHiddenIds((current) => new Set(current).add(id));
    }

    try {
      const response = await fetch(`/api/admin/components/promo-banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (shouldHideOptimistically) {
          setHiddenIds((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
        }
        setNotice({
          type: "error",
          title: "No se pudo completar",
          message: typeof data.error === "string" ? data.error : "Intenta nuevamente.",
        });
        return;
      }

      const fallback = action === "publish"
        ? "Publicado exitosamente."
        : action === "draft"
          ? "Borrador guardado correctamente."
          : action === "trash"
            ? "Movido a papelera exitosamente."
            : "Cambio aplicado correctamente.";

      setNotice({
        type: "success",
        title: "Acción completada",
        message: fallback,
      });
      router.refresh();
    } catch {
      if (shouldHideOptimistically) {
        setHiddenIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
      setNotice({
        type: "error",
        title: "No se pudo conectar",
        message: "Revisa la conexión y vuelve a intentarlo.",
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <section className={`promo-modal-control ${activeBanner ? "is-active" : "is-disabled"}`}>
        <div>
          <p className="auth-kicker">Modal de inicio</p>
          <h3>{activeBanner ? "Activo" : "Desactivado"}</h3>
          <p>
            {activeBanner
              ? `Mostrando: ${activeBanner.title}`
              : "No se muestra ningún banner al entrar al home."}
          </p>
        </div>
        {activeBanner ? (
          <button className="secondary-btn" type="button" onClick={disableModal} disabled={Boolean(pending)}>
            <span className="material-symbols-outlined" aria-hidden="true">visibility_off</span>
            {pending === "modal:disable" ? "Desactivando..." : "Desactivar modal"}
          </button>
        ) : (
          <span className="promo-visibility-pill promo-visibility-pill--idle">
            <span className="material-symbols-outlined" aria-hidden="true">visibility_off</span>
            Sin banner visible
          </span>
        )}
      </section>
      <div className="admin-card-list promo-card-list">
        {items.map((banner) => {
          const visibility = getVisibilityState(banner);
          const isVisible = visibility.canShowNow;
          const actionPending = (action: string) => pending === `${banner.id}:${action}`;
          const shouldActivate = !isVisible;

          return (
            <article
              key={banner.id}
              className={`admin-list-card promo-admin-card ${isVisible ? "promo-admin-card--active" : ""} ${visibility.tone === "error" ? "promo-admin-card--blocked" : ""}`}
              style={hiddenIds.has(banner.id) ? { display: "none" } : undefined}
            >
              <div className="promo-admin-card__preview">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>
              <div className="admin-list-card__body">
                <div className="admin-list-card__head">
                  <div>
                    <p className="auth-kicker">{banner.key_text || "Banner promocional"}</p>
                    <h3>{banner.title}</h3>
                    <p>{stripMarkdown(banner.text) || "Sin descripción general."}</p>
                  </div>
                  <div className="badge-stack">
                    <span className={`promo-visibility-pill promo-visibility-pill--${visibility.tone}`}>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {isVisible ? "visibility" : visibility.tone === "error" ? "error" : "visibility_off"}
                      </span>
                      {visibility.label}
                    </span>
                    <span className={`status-pill status-pill--${banner.status}`}>
                      {statusLabels[banner.status]}
                    </span>
                  </div>
                </div>

                <p className="admin-list-card__copy">{visibility.message}</p>

                <div className="admin-list-card__meta">
                  <span>Botón: {banner.button_text || "Sin texto"}</span>
                  <span>{banner.link_url || "Sin link"}</span>
                </div>

                <div className="row-actions admin-list-card__actions promo-admin-card__actions">
                  {shouldActivate ? (
                    <button className="primary-btn" type="button" onClick={() => run(banner.id, "publish")} disabled={Boolean(pending)}>
                      <span className="material-symbols-outlined" aria-hidden="true">radio_button_checked</span>
                      {actionPending("publish") ? "Publicando..." : "Publicar"}
                    </button>
                  ) : (
                    <button className="secondary-btn" type="button" onClick={() => run(banner.id, "draft")} disabled={Boolean(pending)}>
                      <span className="material-symbols-outlined" aria-hidden="true">toggle_off</span>
                      {actionPending("draft") ? "Guardando..." : "Borrador"}
                    </button>
                  )}
                  <a className="link-btn" href={`/admin/components/promo-banners/${banner.id}/edit`}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                    Editar
                  </a>
                  <button
                    className="danger-btn"
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => setConfirm({
                      id: banner.id,
                      action: "trash",
                      title: "Mover a papelera",
                      message: `Se moverá "${banner.title}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                      confirmLabel: "Papelera",
                    })}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                    {actionPending("trash") ? "Enviando..." : "Papelera"}
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
        details={notice?.details}
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
