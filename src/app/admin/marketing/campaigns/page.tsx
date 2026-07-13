import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import CampaignsTable from "@/components/admin/marketing/CampaignsTable";
import { getCampaigns } from "@/lib/cms/marketing";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Campañas UTM</h1>
          <p className="text-body-md text-on-surface-variant">Crea y gestiona campañas UTM para medir publicaciones, newsletters y colaboraciones.</p>
        </div>
        <Link href="/admin/marketing/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-label-md font-semibold text-on-secondary transition-colors hover:bg-secondary/90 shrink-0">
          <span className="material-symbols-outlined text-lg">add</span>
          Nueva campaña
        </Link>
      </div>
      <CampaignsTable campaigns={campaigns} />
    </AdminShell>
  );
}
