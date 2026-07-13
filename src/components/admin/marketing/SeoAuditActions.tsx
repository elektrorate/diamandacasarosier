"use client";

import type { MarketingSeoAudit } from "@/lib/cms/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

function toCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function buildCsv(rows: MarketingSeoAudit[]) {
  const header = [
    "page_title",
    "page_url",
    "seo_status",
    "slug_status",
    "has_meta_title",
    "has_meta_description",
    "has_og_image",
    "has_canonical",
    "issues",
    "recommendations",
  ];

  const lines = [header.map(toCsvCell).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.page_title,
        row.page_url,
        row.seo_status,
        row.slug_status,
        String(row.has_meta_title),
        String(row.has_meta_description),
        String(row.has_og_image),
        String(row.has_canonical),
        row.issues.join(" | "),
        row.recommendations.join(" | "),
      ].map((value) => toCsvCell(value)).join(","),
    );
  }

  return lines.join("\n");
}

export default function SeoAuditActions({ pages }: { pages: MarketingSeoAudit[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRunAudit() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/marketing/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo ejecutar la auditoría SEO.");
      }

      setMessage(data?.message || "Auditoría ejecutada correctamente.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al ejecutar la auditoría.");
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (!pages.length) return;
    const blob = new Blob([buildCsv(pages)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "auditoria-seo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!pages.length}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-transparent px-4 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[1.2em]" aria-hidden="true">download</span>
          Exportar CSV
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleRunAudit}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-transparent px-4 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[1.2em]" aria-hidden="true">{loading ? "progress_activity" : "fact_check"}</span>
          {loading ? "Ejecutando..." : "Ejecutar auditoría"}
        </button>
      </div>
      {message ? <p className="max-w-md text-body-sm text-on-surface-variant">{message}</p> : null}
    </div>
  );
}
