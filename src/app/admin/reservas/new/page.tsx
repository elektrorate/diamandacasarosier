import ReservationForm from "@/components/admin/ReservationForm";

export default function NewReserva() {
  return (
    <div className="page-card">
      <div className="page-header"><h2>Nueva reserva</h2><a className="secondary-btn" href="/admin/reservas">Volver</a></div>
      <ReservationForm mode="create" />
    </div>
  );
}
