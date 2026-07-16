import AdminShell from "@/components/admin/AdminShell";
import OfferingForm from "@/components/admin/OfferingForm";

type NewOfferingSearchParams = { type?: string };

export default async function NewOfferingPage({ searchParams }: { searchParams?: Promise<NewOfferingSearchParams> }) {
  const params = await searchParams;
  return (
    <AdminShell>
      <div className="section-head">
        <div><p className="auth-kicker">Clases y Talleres</p><h2>Nuevo contenido</h2></div>
      </div>
      <OfferingForm mode="create" defaultType={params?.type} />
    </AdminShell>
  );
}
