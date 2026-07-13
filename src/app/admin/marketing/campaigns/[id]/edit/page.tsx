import AdminShell from "@/components/admin/AdminShell";
import CampaignForm from "@/components/admin/marketing/CampaignForm";
import { getCampaignById } from "@/lib/cms/marketing";

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);

  if (!campaign) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-body-md text-on-surface-variant">Campaña no encontrada.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Editar campaña</h1>
        <p className="text-body-md text-on-surface-variant">Modifica los parámetros de la campaña UTM.</p>
      </div>
      <CampaignForm initial={campaign as unknown as Partial<{
        id: string; name: string; slug: string;
        utm_source: string; utm_medium: string; utm_campaign: string;
        utm_content: string; utm_term: string;
        destination_url: string; generated_url: string;
        start_date: string; end_date: string; notes: string;
      }>} />
    </AdminShell>
  );
}
