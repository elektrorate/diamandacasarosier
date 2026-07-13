"use client";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { MarketingSeoAudit, MarketingSeoStatus } from "@/lib/cms/types";
import { useState } from "react";
import EmptyMarketingState from "./EmptyMarketingState";

export default function SeoAuditTable({ pages }: { pages: MarketingSeoAudit[] }) {
  const [status, setStatus] = useState<"all" | MarketingSeoStatus>("all");
  const [selected, setSelected] = useState<MarketingSeoAudit | null>(null);

  const filteredPages = status === "all" ? pages : pages.filter((page) => page.seo_status === status);

  if (!pages.length) {
    return (
      <EmptyMarketingState
        title="Ejecuta una auditoría SEO"
        description="Analiza títulos, descripciones, imágenes Open Graph, canonical y slugs para detectar mejoras pendientes."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "ok", "incomplete", "review", "error", "pending"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`rounded-full px-3 py-1 text-label-sm transition-colors ${status === option ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/80"}`}
          >
            {option === "all" ? "Todos" : option}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-high text-label-sm font-semibold text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Página</th>
              <th className="px-4 py-3">Meta</th>
              <th className="px-4 py-3">Checks</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado SEO</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredPages.map((p) => (
              <tr
                key={p.id}
                className={`transition-colors hover:bg-surface-container-low ${p.seo_status === "ok" ? "bg-white" : "bg-red-50/40"}`}
              >
                <td className="max-w-xs px-4 py-3">
                  <div className="truncate font-medium text-on-surface">{p.page_title}</div>
                  <div className="truncate text-label-sm text-on-surface-variant">{p.page_url}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-base ${p.has_meta_title ? "text-green-600" : "text-red-400"}`} aria-hidden="true">{p.has_meta_title ? "check_circle" : "cancel"}</span>
                      <span className="text-label-sm text-on-surface-variant">Title</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-base ${p.has_meta_description ? "text-green-600" : "text-red-400"}`} aria-hidden="true">{p.has_meta_description ? "check_circle" : "cancel"}</span>
                      <span className="text-label-sm text-on-surface-variant">Description</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-base ${p.has_og_image ? "text-green-600" : "text-red-400"}`} aria-hidden="true">{p.has_og_image ? "check_circle" : "cancel"}</span>
                      <span className="text-label-sm text-on-surface-variant">OG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-base ${p.has_canonical ? "text-green-600" : "text-red-400"}`} aria-hidden="true">{p.has_canonical ? "check_circle" : "cancel"}</span>
                      <span className="text-label-sm text-on-surface-variant">Canonical</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.slug_status === "ok" ? "success" : p.slug_status === "review" ? "warning" : "error"}>{p.slug_status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.seo_status === "ok" ? "success" : p.seo_status === "incomplete" ? "warning" : p.seo_status === "review" ? "error" : "neutral"}>{p.seo_status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {p.edit_url ? (
                      <Button href={p.edit_url} size="sm" variant="outlined">
                        Editar
                      </Button>
                    ) : null}
                    <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(p)}>
                      Ver detalles
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await navigator.clipboard.writeText(p.page_url);
                      }}
                    >
                      Copiar URL
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPages.length === 0 ? (
          <div className="border-t border-outline-variant px-4 py-10 text-center text-body-sm text-on-surface-variant">
            No hay resultados para este filtro.
          </div>
        ) : null}
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Detalles SEO: ${selected.page_title}` : "Detalles SEO"}>
        {selected ? (
          <div className="space-y-4 text-body-sm text-on-surface">
            <div>
              <p className="text-label-sm text-on-surface-variant">URL</p>
              <p className="break-all">{selected.page_url}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Issues</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.issues.length > 0 ? selected.issues.map((issue) => <Badge key={issue} variant="error">{issue}</Badge>) : <Badge variant="success">Sin issues</Badge>}
              </div>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Recomendaciones</p>
              <ul className="mt-2 space-y-2">
                {selected.recommendations.length > 0 ? selected.recommendations.map((item) => <li key={item} className="rounded-lg bg-surface-container-low px-3 py-2">{item}</li>) : <li className="rounded-lg bg-surface-container-low px-3 py-2">Sin recomendaciones pendientes.</li>}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-container-low px-3 py-2">
                <p className="text-label-sm text-on-surface-variant">Meta title</p>
                <p>{selected.meta_title || "-"}</p>
              </div>
              <div className="rounded-lg bg-surface-container-low px-3 py-2">
                <p className="text-label-sm text-on-surface-variant">Meta description</p>
                <p>{selected.meta_description || "-"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
