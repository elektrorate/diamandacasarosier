import AdminShell from "@/components/admin/AdminShell";
import EmptyMarketingState from "@/components/admin/marketing/EmptyMarketingState";

export default async function ConversionsPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Conversiones</h1>
        <p className="text-body-md text-on-surface-variant">Registro de conversiones: WhatsApp, formularios, reservas y compras.</p>
      </div>
      <EmptyMarketingState
        title="No hay conversiones registradas todavía"
        description="Activa el tracking desde Configuración para empezar a medir conversiones."
        actionHref="/admin/marketing/settings"
        actionLabel="Ir a configuración"
      />
    </AdminShell>
  );
}
