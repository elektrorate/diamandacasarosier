import AdminShell from "@/components/admin/AdminShell";
import SeoAuditActions from "@/components/admin/marketing/SeoAuditActions";
import MarketingStatCard from "@/components/admin/marketing/MarketingStatCard";
import SeoAuditTable from "@/components/admin/marketing/SeoAuditTable";
import { getSeoAudit } from "@/lib/cms/marketing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SeoPage() {
  const seoPages = await getSeoAudit();
  const okCount = seoPages.filter((page) => page.seo_status === "ok").length;
  const incompleteCount = seoPages.filter((page) => page.seo_status === "incomplete").length;
  const reviewCount = seoPages.filter((page) => page.seo_status === "review").length;
  const pendingCount = seoPages.filter((page) => page.seo_status === "pending").length;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">SEO</h1>
          <p className="text-body-md text-on-surface-variant">Auditoría SEO de las páginas del sitio.</p>
        </div>
        <SeoAuditActions pages={seoPages} />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MarketingStatCard label="Total analizadas" value={seoPages.length} icon="fact_check" />
        <MarketingStatCard label="Correctas" value={okCount} icon="check_circle" />
        <MarketingStatCard label="Incompletas" value={incompleteCount} icon="warning" />
        <MarketingStatCard label="Revisar" value={reviewCount + pendingCount} icon="error" />
      </div>
      <SeoAuditTable pages={seoPages} />
    </AdminShell>
  );
}
