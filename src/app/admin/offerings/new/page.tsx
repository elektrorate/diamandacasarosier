import AdminShell from "@/components/admin/AdminShell";
import OfferingForm from "@/components/admin/OfferingForm";

export default async function NewOfferingPage({ searchParams }: { searchParams?: { type?: string } }) {
  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">Clases y Talleres</p>
          <h2>Nuevo contenido</h2>
        </div>
      </div>

      <OfferingForm mode="create" defaultType={searchParams?.type} />
    </AdminShell>
  );
}
