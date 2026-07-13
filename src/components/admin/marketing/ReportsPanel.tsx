"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import type { MarketingReport, MarketingReportType } from "@/lib/cms/types";

const reportTypes: { value: MarketingReportType; label: string; description: string }[] = [
  { value: "weekly", label: "Semanal", description: "Actividad general y pendientes rápidos." },
  { value: "monthly", label: "Mensual", description: "Resumen ejecutivo para revisar tendencia." },
  { value: "campaign", label: "Campañas", description: "Enfoque en URLs UTM y performance." },
  { value: "page", label: "Páginas", description: "Lectura por contenido y visitas." },
  { value: "seo", label: "SEO", description: "Estado de auditoría y recomendaciones." },
  { value: "conversion", label: "Conversiones", description: "Eventos críticos y acciones medibles." },
];

export default function ReportsPanel({ initialReports }: { initialReports: MarketingReport[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  }, []);
  const [type, setType] = useState<MarketingReportType>("weekly");
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(today);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function generateReport() {
    setGenerating(true);
    setMessage("");
    const response = await fetch("/api/admin/marketing/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        date_from: dateFrom,
        date_to: dateTo,
      }),
    });

    const data = await response.json().catch(() => null);
    if (response.ok) {
      setMessage("Reporte generado y listo para descarga.");
      router.refresh();
    } else {
      setMessage(data?.error || "No se pudo generar el reporte.");
    }
    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-outline-variant bg-white p-5 shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-label-caps uppercase text-secondary">Generador</p>
            <h2 className="mt-1 text-headline-sm text-on-surface">Crear reporte de marketing</h2>
            <p className="mt-1 max-w-2xl text-body-sm text-on-surface-variant">
              El reporte cruza configuración, eventos capturados, campañas UTM, auditoría SEO y métricas disponibles. Si Supabase no está listo, se guarda localmente para que el flujo no se bloquee.
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <span className="block text-label-sm font-semibold text-on-surface-variant">Reportes generados</span>
            <span className="mt-1 block text-headline-sm tabular-nums text-on-surface">{initialReports.length}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {reportTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={`min-h-24 rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container ${
                  type === item.value
                    ? "border-secondary bg-surface-container-low text-on-surface"
                    : "border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
                aria-pressed={type === item.value}
              >
                <span className="block text-body-md font-bold">{item.label}</span>
                <span className="mt-1 block text-label-md">{item.description}</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label>
                <span className="mb-1 block text-label-sm font-semibold text-on-surface">Desde</span>
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="admin-marketing-input" />
              </label>
              <label>
                <span className="mb-1 block text-label-sm font-semibold text-on-surface">Hasta</span>
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="admin-marketing-input" />
              </label>
            </div>
            <div className="mt-4">
              <Button type="button" onClick={generateReport} disabled={generating || !dateFrom || !dateTo} icon={generating ? "progress_activity" : "summarize"}>
                {generating ? "Generando..." : "Generar reporte"}
              </Button>
            </div>
            {message ? <p className="mt-3 text-label-sm font-semibold text-on-surface-variant">{message}</p> : null}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-[0_12px_28px_rgba(11,28,48,0.05)]">
        <div className="border-b border-outline-variant bg-surface-container-low px-5 py-4">
          <h2 className="text-headline-sm text-on-surface">Historial de reportes</h2>
          <p className="text-body-sm text-on-surface-variant">Descarga reportes listos o genera uno nuevo con otro rango.</p>
        </div>
        {initialReports.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container-high text-label-sm font-semibold text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Rango</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Generado</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {initialReports.map((report) => (
                  <tr key={report.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 font-semibold text-on-surface">{report.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{report.type}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{report.date_from || "-"} a {report.date_to || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{report.status}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{report.generated_at ? new Date(report.generated_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">
                      {report.file_url ? (
                        <a
                          href={report.file_url}
                          download={`${report.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant px-3 text-label-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container"
                        >
                          <span className="material-symbols-outlined text-lg" aria-hidden="true">download</span>
                          Descargar
                        </a>
                      ) : (
                        <span className="text-label-sm text-on-surface-variant">Sin archivo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-surface-container-low text-secondary" aria-hidden="true">
              <span className="material-symbols-outlined text-3xl">summarize</span>
            </span>
            <h3 className="mt-4 text-title-md font-bold text-on-surface">No hay reportes generados</h3>
            <p className="mt-1 max-w-md text-body-md text-on-surface-variant">Selecciona un tipo de reporte y un rango de fechas para crear el primero.</p>
          </div>
        )}
      </section>
    </div>
  );
}
