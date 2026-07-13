import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import MarketingStatCard from "@/components/admin/marketing/MarketingStatCard";
import EmptyMarketingState from "@/components/admin/marketing/EmptyMarketingState";
import { getMarketingSettings } from "@/lib/cms/marketing";

export default async function MarketingDashboard() {
  const settings = await getMarketingSettings();
  const analyticsActive = settings.analytics_enabled;
  const gaStatus = settings.ga4_measurement_id ? "Pendiente de integración" : "Pendiente";
  const gscStatus = settings.google_search_console_id ? "Pendiente de integración" : "Pendiente";

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Marketing</h1>
          <p className="text-body-md text-on-surface-variant">Resumen general del rendimiento de la web, campañas, tráfico y conversiones.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/marketing/settings" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-label-sm font-bold text-on-secondary transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary-container">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">settings</span>
            Configuración
          </Link>
        </div>
      </div>

      {/* Connection status */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${analyticsActive ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-label-sm text-on-surface-variant">Analítica interna: {analyticsActive ? "Activa" : "Inactiva"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${settings.ga4_measurement_id ? "bg-amber-500" : "bg-gray-300"}`} />
          <span className="text-label-sm text-on-surface-variant">GA4: {gaStatus}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${settings.google_search_console_id ? "bg-amber-500" : "bg-gray-300"}`} />
          <span className="text-label-sm text-on-surface-variant">Search Console: {gscStatus}</span>
        </div>
      </div>

      {!analyticsActive ? (
        <EmptyMarketingState
          title="Activa la analítica interna"
          description="Desde Configuración puedes activar page views, eventos, UTM y SEO técnico. GA4 y Search Console quedarán pendientes hasta integrar sus APIs."
          actionLabel="Abrir configuración"
          actionHref="/admin/marketing/settings"
        />
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MarketingStatCard label="Visitas" value="—" icon="visibility" />
            <MarketingStatCard label="Usuarios" value="—" icon="people" />
            <MarketingStatCard label="Conversiones" value="—" icon="conversion_path" />
            <MarketingStatCard label="CTR medio" value="—" icon="trending_up" />
          </div>

          <div className="rounded-xl border border-dashed border-outline-variant bg-white p-8 text-center">
            <p className="text-body-md text-on-surface-variant">La analítica interna ya puede guardar eventos. GA4 y Search Console seguirán pendientes hasta conectar sus APIs.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/admin/marketing/analytics" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-label-md font-semibold text-on-secondary transition-colors hover:bg-secondary/90">
                <span className="material-symbols-outlined text-lg">sync</span>
                Ver Analytics
              </Link>
              <Link href="/admin/marketing/search-console" className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-5 py-2.5 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
                Ver Search Console
              </Link>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
