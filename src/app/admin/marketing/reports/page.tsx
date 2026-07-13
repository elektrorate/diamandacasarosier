import AdminShell from "@/components/admin/AdminShell";
import ReportsPanel from "@/components/admin/marketing/ReportsPanel";
import { getReports } from "@/lib/cms/marketing";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Reportes</h1>
        <p className="text-body-md text-on-surface-variant">Genera y descarga reportes de rendimiento, campañas, conversiones y SEO.</p>
      </div>
      <ReportsPanel initialReports={reports} />
    </AdminShell>
  );
}
