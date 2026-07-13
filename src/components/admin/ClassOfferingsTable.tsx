"use client";

import Image from "next/image";
import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AdminActionModal from "./AdminActionModal";
import type { Offering } from "@/lib/cms/types";

type Notice = { type: "success" | "error"; title: string; message: string };
type ConfirmAction = { id: string; title: string; message: string; confirmLabel: string };

function formatCurrency(value: number | null, currency: string) {
  if (value === null) return "0€";
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;
  return currency === "EUR" ? `${value}${symbol}` : `${symbol}${value}`;
}

function formatStatus(status: Offering["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  if (status === "archived") return "Archivado";
  return "Eliminado";
}

function isOffering(value: unknown): value is Offering {
  return Boolean(value && typeof value === "object" && "id" in value && "type" in value && "title" in value);
}

export default function ClassOfferingsTable({
  offerings,
  basePath = "/admin/clases",
  typeLabel = "Clase",
}: {
  offerings: Offering[];
  basePath?: string;
  typeLabel?: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [localOfferings, setLocalOfferings] = useState<Offering[]>([]);
  const isBusy = Boolean(pendingId);
  const visibleOfferings = useMemo(() => {
    const localIds = new Set(localOfferings.map((offering) => offering.id));
    return [...localOfferings, ...offerings.filter((offering) => !localIds.has(offering.id))];
  }, [localOfferings, offerings]);

  function successMessage(action: string) {
    if (action === "duplicate") return `${typeLabel} duplicado correctamente.`;
    if (action === "publish") return `${typeLabel} publicado correctamente.`;
    if (action === "draft") return `${typeLabel} pasado a borrador correctamente.`;
    if (action === "trash") return `${typeLabel} enviado a la papelera correctamente.`;
    return "Acción completada correctamente.";
  }

  async function patchOffering(id: string, action: string) {
    const shouldHideOptimistically = action === "trash";
    setNotice(null);
    setPendingId(id);
    if (shouldHideOptimistically) {
      setHiddenIds((current) => new Set(current).add(id));
    }

    try {
      const response = await fetch(`/api/admin/offerings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; offering?: unknown };

      if (response.ok) {
        const returnedOffering = data.offering;
        if (isOffering(returnedOffering)) {
          setLocalOfferings((current) => {
            const withoutCurrent = current.filter((item) => item.id !== returnedOffering.id);
            return [returnedOffering, ...withoutCurrent];
          });
        }
        setNotice({ type: "success", title: "Acción completada", message: successMessage(action) });
        router.refresh();
        return;
      }

      if (shouldHideOptimistically) {
        setHiddenIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
      setNotice({ type: "error", title: "No se pudo completar", message: data.error || "No se pudo completar la acción." });
    } catch {
      if (shouldHideOptimistically) {
        setHiddenIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
      setNotice({ type: "error", title: "No se pudo conectar", message: "No se pudo conectar con el servidor. Intenta nuevamente." });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
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
          if (confirm) void patchOffering(confirm.id, "trash");
        }}
        onClose={() => setConfirm(null)}
      />

      {visibleOfferings.map((offering, index) => {
        const isPending = pendingId === offering.id;
        const duration = offering.duration || "Duración sin definir";

        return (
          <article
            key={offering.id}
            className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center"
            style={hiddenIds.has(offering.id) ? { display: "none" } : undefined}
          >
            <Link
              href={`${basePath}/${offering.id}/edit`}
              className={`relative h-32 w-full overflow-hidden rounded-xl border sm:h-20 sm:w-[120px] sm:flex-none ${
                index === 0 ? "border-secondary ring-2 ring-secondary-container" : "border-outline-variant"
              }`}
            >
              {offering.cover_image_url ? (
                <Image
                  src={offering.cover_image_url}
                  alt={offering.title}
                  fill
                  sizes="(min-width: 640px) 120px, 100vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-outline">
                  <span className="material-symbols-outlined text-3xl">image</span>
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-md font-medium text-on-surface-variant">
                  {typeLabel}
                </span>
                <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-md font-medium text-on-surface-variant">
                  {formatStatus(offering.status)}
                </span>
              </div>
              <Link
                href={`${basePath}/${offering.id}/edit`}
                className="block text-title-md font-bold text-on-surface transition-colors hover:text-primary"
              >
                {offering.title}
              </Link>
              <p className="mt-1 line-clamp-2 text-body-md text-on-surface-variant">
                {offering.excerpt || "Sin descripción corta."}
              </p>
              <p className="mt-2 text-label-md text-on-surface">
                <span className="font-bold text-secondary">{formatCurrency(offering.price, offering.currency)}</span>
                <span className="mx-2 text-on-surface-variant">·</span>
                <span>Duración total: {duration}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-outline-variant pt-3 sm:flex-col sm:items-stretch sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <Link
                href={`${basePath}/${offering.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Editar
              </Link>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => patchOffering(offering.id, "duplicate")}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
                {isPending ? "Procesando..." : "Duplicar"}
              </button>
              {offering.status === "published" ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => patchOffering(offering.id, "draft")}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                  Borrador
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => patchOffering(offering.id, "publish")}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-secondary transition-colors hover:bg-secondary-container/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">publish</span>
                  Publicar
                </button>
              )}
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setConfirm({
                  id: offering.id,
                  title: "Mover a papelera",
                  message: `Se moverá "${offering.title}" a la papelera. Puedes restaurarlo después desde Papelera.`,
                  confirmLabel: "Papelera",
                })}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                {isPending ? "Enviando..." : "Papelera"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
