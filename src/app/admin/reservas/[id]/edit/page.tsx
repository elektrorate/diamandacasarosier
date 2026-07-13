import ReservationForm from "@/components/admin/ReservationForm";
import { getReservationById } from "@/lib/cms/reservations";
import { notFound } from "next/navigation";

export default async function EditReserva({ params }: { params: Promise<{ id: string }> }) {
  const item = await getReservationById((await params).id);
  if (!item) notFound();
  return (
    <div className="page-card">
      <div className="page-header"><h2>Editar reserva: {item.customer_name}</h2><a className="secondary-btn" href="/admin/reservas">Volver</a></div>
      <ReservationForm mode="edit" item={item} />
    </div>
  );
}
