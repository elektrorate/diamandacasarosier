"use client";

import Link from "@/components/admin/AdminLink";
import { useRouter } from "next/navigation";
import type { MarketingCampaign } from "@/lib/cms/types";
import { formatAdminDate } from "@/lib/admin/date-format";
import EmptyMarketingState from "./EmptyMarketingState";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-yellow-100 text-yellow-700",
  finished: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-400",
};

export default function CampaignsTable({ campaigns }: { campaigns: MarketingCampaign[] }) {
  const router = useRouter();

  async function runAction(id: string, action: string) {
    if (action === "delete" && !window.confirm("¿Eliminar esta campaña?")) return;
    const method = action === "delete" ? "DELETE" : "PATCH";
    const res = await fetch(`/api/admin/marketing/campaigns/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) router.refresh();
  }

  if (!campaigns.length) {
    return (
      <EmptyMarketingState
        title="No hay campañas UTM creadas"
        description="Crea tu primera campaña para generar URLs con parámetros UTM y medir publicaciones, newsletters o colaboraciones."
        actionLabel="Nueva campaña"
        actionHref="/admin/marketing/campaigns/new"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
      <table className="w-full text-left text-body-sm">
        <thead className="bg-surface-container-high text-label-sm font-semibold text-on-surface-variant">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Fuente</th>
            <th className="px-4 py-3">Medio</th>
            <th className="px-4 py-3">Campaña</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3">Fin</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {campaigns.map((c) => (
            <tr key={c.id} className="bg-white transition-colors hover:bg-surface-container-low">
              <td className="px-4 py-3">
                <div className="font-medium text-on-surface">{c.name}</div>
                <div className="max-w-xs truncate text-label-sm text-on-surface-variant">{c.destination_url}</div>
              </td>
              <td className="px-4 py-3 text-on-surface-variant">{c.utm_source}</td>
              <td className="px-4 py-3 text-on-surface-variant">{c.utm_medium}</td>
              <td className="px-4 py-3 text-on-surface-variant">{c.utm_campaign}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[c.status] || "bg-gray-100 text-gray-500"}`}>
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-on-surface-variant">{c.start_date ? formatAdminDate(c.start_date) : "—"}</td>
              <td className="px-4 py-3 text-on-surface-variant">{c.end_date ? formatAdminDate(c.end_date) : "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Link href={`/admin/marketing/campaigns/${c.id}/edit`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container" aria-label={`Editar campaña ${c.name}`}>
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span>
                  </Link>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(c.generated_url); }} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-container" title="Copiar URL" aria-label={`Copiar URL de ${c.name}`}>
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">content_copy</span>
                  </button>
                  {(c.status === "active" || c.status === "draft") ? (
                    <button type="button" onClick={() => runAction(c.id, "archive")} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container" aria-label={`Archivar campaña ${c.name}`}>
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">archive</span>
                    </button>
                  ) : null}
                  <button type="button" onClick={() => runAction(c.id, "delete")} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error focus:outline-none focus:ring-2 focus:ring-primary-container" aria-label={`Eliminar campaña ${c.name}`}>
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
