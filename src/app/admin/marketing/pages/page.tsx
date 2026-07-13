import AdminShell from "@/components/admin/AdminShell";
import EmptyMarketingState from "@/components/admin/marketing/EmptyMarketingState";

export default async function MarketingPagesPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Páginas</h1>
        <p className="text-body-md text-on-surface-variant">Métricas de rendimiento por página del sitio.</p>
      </div>
      <EmptyMarketingState
        title="No hay métricas de páginas todavía"
        description="La analítica interna puede registrar eventos; las métricas importadas por página aparecerán cuando se conecte la API de GA4."
        actionHref="/admin/marketing/settings"
        actionLabel="Ir a configuración"
      />
    </AdminShell>
  );
}
