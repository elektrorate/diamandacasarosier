import AdminShell from "@/components/admin/AdminShell";
import EmptyMarketingState from "@/components/admin/marketing/EmptyMarketingState";
import { getMarketingSettings } from "@/lib/cms/marketing";

export default async function SearchConsolePage() {
  const settings = await getMarketingSettings();
  const status = settings.google_search_console_id
    ? `Pendiente de integración (${settings.google_search_console_id})`
    : "Pendiente de configurar";

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Search Console</h1>
        <p className="text-body-md text-on-surface-variant">Rendimiento orgánico, consultas, páginas y posición media en Google.</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${settings.google_search_console_id ? "bg-amber-500" : "bg-gray-300"}`} />
          <span className="text-label-sm text-on-surface-variant">Search Console: {status}</span>
        </div>
      </div>
      <EmptyMarketingState
        title="No hay datos de Google Search Console todavía"
        description="La propiedad puede guardarse desde Configuración, pero los datos aparecerán cuando se conecte la API de Search Console."
        actionLabel="Ir a configuración"
        actionHref="/admin/marketing/settings"
      />
    </AdminShell>
  );
}
