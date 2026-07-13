import AdminShell from "@/components/admin/AdminShell";
import EmptyMarketingState from "@/components/admin/marketing/EmptyMarketingState";
import { getMarketingSettings } from "@/lib/cms/marketing";

export default async function AnalyticsPage() {
  const settings = await getMarketingSettings();
  const ga4PendingLabel = settings.ga4_measurement_id
    ? `Pendiente de integración (${settings.ga4_measurement_id})`
    : "Pendiente de configurar";

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Analytics</h1>
        <p className="text-body-md text-on-surface-variant">Métricas de tráfico, páginas, fuentes y conversiones desde Google Analytics.</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${settings.ga4_measurement_id ? "bg-amber-500" : "bg-gray-300"}`} />
          <span className="text-label-sm text-on-surface-variant">GA4: {ga4PendingLabel}</span>
        </div>
      </div>
      <EmptyMarketingState
        title="No hay datos de Google Analytics todavía"
        description="Puedes guardar el Measurement ID en Configuración; las métricas aparecerán cuando se implemente la integración real con la API de GA4."
        actionLabel="Ir a configuración"
        actionHref="/admin/marketing/settings"
      />
    </AdminShell>
  );
}
