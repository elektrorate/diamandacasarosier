import ReservationsTable from "@/components/admin/ReservationsTable";
import ReservationsSummaryCards from "@/components/admin/ReservationsSummaryCards";
import { getReservations } from "@/lib/cms/reservations";
import { getOfferings } from "@/lib/cms/offerings";

export default async function ReservasPage() {
  const [items, offerings] = await Promise.all([getReservations(), getOfferings()]);
  const active = items.filter((r) => r.status !== "deleted");
  return (
    <div className="page-card">
      <div className="page-header"><h2>Reservas</h2><a className="primary-btn" href="/admin/reservas/new">Nueva reserva</a></div>
      <ReservationsSummaryCards items={active} />
      {active.length === 0 ? <p className="muted">No hay reservas activas.</p> : <ReservationsTable items={active} offerings={offerings} />}
    </div>
  );
}
