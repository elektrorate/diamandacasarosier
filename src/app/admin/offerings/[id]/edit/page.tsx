import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import OfferingForm from "@/components/admin/OfferingForm";
import TopBar from "@/components/layout/TopBar";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { requireAdminProfile } from "@/lib/auth/supabase-auth";
import { getOfferingById } from "@/lib/cms/offerings";

export default async function EditOfferingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminProfile();
  if (!session) redirect("/auth");

  const offering = await getOfferingById((await params).id);
  if (!offering) {
    return (
      <AdminShell>
        <EmptyState
          icon="inventory_2"
          title="Offering no encontrado"
          description="El contenido que intentas editar no existe o fue eliminado."
          action={<Button href="/admin/offerings">Volver al listado</Button>}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <TopBar title="Editar contenido" subtitle="Offerings" />

      <OfferingForm mode="edit" offering={offering} />
    </AdminShell>
  );
}
