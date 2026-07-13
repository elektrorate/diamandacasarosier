import AdminShell from "@/components/admin/AdminShell";
import EventsTable from "@/components/admin/marketing/EventsTable";
import { getEventTypes } from "@/lib/cms/marketing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
  const events = await getEventTypes();

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Eventos</h1>
        <p className="text-body-md text-on-surface-variant">Eventos personalizados que se pueden medir en el sitio.</p>
      </div>
      <EventsTable events={events} />
    </AdminShell>
  );
}
