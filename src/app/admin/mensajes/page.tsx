import AdminShell from "@/components/admin/AdminShell";
import MessagesTable from "@/components/admin/MessagesTable";
import TopBar from "@/components/layout/TopBar";
import { getFormSubmissions } from "@/lib/cms/form-submissions";

export default async function MensajesPage() {
  const items = await getFormSubmissions();
  const active = items.filter((s) => s.status !== "deleted");
  return (
    <AdminShell>
      <TopBar
        title="Mensajes de Contacto"
        subtitle="Gestiona los mensajes recibidos desde los formularios activos."
      />
      {active.length === 0 ? <p className="muted">No hay mensajes recibidos.</p> : <MessagesTable items={active} />}
    </AdminShell>
  );
}
