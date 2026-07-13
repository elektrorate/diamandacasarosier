import AdminShell from "@/components/admin/AdminShell";
import MessageDetail from "@/components/admin/MessageDetail";
import TopBar from "@/components/layout/TopBar";
import { getFormSubmissionById } from "@/lib/cms/form-submissions";
import { notFound } from "next/navigation";

export default async function MensajePage({ params }: { params: Promise<{ id: string }> }) {
  const item = await getFormSubmissionById((await params).id);
  if (!item) notFound();
  return (
    <AdminShell>
      <TopBar title="Detalle de mensaje" subtitle="Revisa la consulta, actualiza el estado y agrega notas internas." />
      <MessageDetail item={item} />
    </AdminShell>
  );
}
