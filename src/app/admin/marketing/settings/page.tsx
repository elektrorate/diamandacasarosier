import AdminShell from "@/components/admin/AdminShell";
import MarketingSettingsForm from "@/components/admin/marketing/MarketingSettingsForm";

export default function MarketingSettingsPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Configuración de Marketing</h1>
        <p className="text-body-md text-on-surface-variant">Gestiona conexiones con Google Analytics, Search Console y opciones de tracking.</p>
      </div>
      <MarketingSettingsForm />
    </AdminShell>
  );
}
