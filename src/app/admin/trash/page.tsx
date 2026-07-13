import AdminShell from "@/components/admin/AdminShell";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import TrashTable from "@/components/admin/TrashTable";
import { getTrashItemsPage } from "@/lib/cms/trash";

export default async function TrashPage() {
  const result = await getTrashItemsPage({ page: 1, pageSize: 30, sort: "newest", entityType: "all" });

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Papelera</h2>
        </div>
      </div>

      {result.total ? (
        <TrashTable
          initialItems={result.items}
          initialEntityOptions={result.entityOptions}
          initialTotal={result.total}
          initialPage={result.page}
          initialPageSize={result.pageSize}
          initialTotalPages={result.totalPages}
          initialSort={result.sort}
        />
      ) : (
        <SectionEmptyState title="Papelera vacía" description="No hay contenidos eliminados por ahora." />
      )}
    </AdminShell>
  );
}
