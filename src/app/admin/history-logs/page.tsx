import AdminShell from "@/components/admin/AdminShell";
import HistoryLogsTable from "@/components/admin/HistoryLogsTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getHistoryLogsPage } from "@/lib/cms/history-logs";

export default async function HistoryLogsPage() {
  const result = await getHistoryLogsPage({ page: 1, pageSize: 30, sort: "newest" });

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Historial de actividad</h2>
          <p className="muted">Registro cronológico de acciones dentro del administrador.</p>
        </div>
      </div>
      {result.total === 0 ? (
        <SectionEmptyState title="Sin actividad" description="No hay registros de actividad por ahora." />
      ) : (
        <HistoryLogsTable
          initialItems={result.items}
          initialTotal={result.total}
          initialPage={result.page}
          initialPageSize={result.pageSize}
          initialTotalPages={result.totalPages}
          initialSort={result.sort}
        />
      )}
    </AdminShell>
  );
}
