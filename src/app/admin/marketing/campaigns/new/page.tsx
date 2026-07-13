import AdminShell from "@/components/admin/AdminShell";
import CampaignForm from "@/components/admin/marketing/CampaignForm";

export default function NewCampaignPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Nueva campaña UTM</h1>
        <p className="text-body-md text-on-surface-variant">Completa los campos para generar una URL con parámetros UTM.</p>
      </div>
      <CampaignForm />
    </AdminShell>
  );
}
