"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Reservation, ReservationPaymentStatus, ReservationStatus, Offering } from "@/lib/cms/types";
import { RESERVATION_STATUSES, RESERVATION_PAYMENT_STATUSES, CURRENCIES } from "@/lib/cms/types";

const statusLabels: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", paid: "Pagada", cancelled: "Cancelada", rescheduled: "Reprogramada", deleted: "Eliminada" };
const payLabels: Record<string, string> = { unpaid: "Impago", pending: "Pendiente", paid: "Pagado", refunded: "Reembolsado", failed: "Fallido" };
const capLabels: Record<string, string> = { class: "Clase", workshop: "Taller", experience: "Experiencia", gift_card: "Gift Card" };

export default function ReservationForm({ mode, item }: { mode: "create" | "edit"; item?: Reservation }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(item?.customer_name ?? "");
  const [customerEmail, setCustomerEmail] = useState(item?.customer_email ?? "");
  const [customerPhone, setCustomerPhone] = useState(item?.customer_phone ?? "");
  const [offeringId, setOfferingId] = useState(item?.offering_id ?? "");
  const [date, setDate] = useState(item?.date ?? "");
  const [time, setTime] = useState(item?.time ?? "");
  const [peopleCount, setPeopleCount] = useState(item?.people_count ?? 1);
  const [status, setStatus] = useState<ReservationStatus>(item?.status ?? "pending");
  const [paymentStatus, setPaymentStatus] = useState<ReservationPaymentStatus>(item?.payment_status ?? "unpaid");
  const [totalAmount, setTotalAmount] = useState<number | null>(item?.total_amount ?? null);
  const [currency, setCurrency] = useState(item?.currency ?? "EUR");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(item?.internal_notes ?? "");
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetch("/api/admin/offerings").then((r) => r.json()).then((d) => setOfferings(d.offerings ?? [])).catch(() => {}); }, []);

  const selectedOffering = offerings.find((o) => o.id === offeringId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!customerName.trim()) { setError("El nombre del cliente es obligatorio."); setIsLoading(false); return; }
    if (!customerEmail.trim()) { setError("El email del cliente es obligatorio."); setIsLoading(false); return; }
    if (!offeringId) { setError("La actividad es obligatoria."); setIsLoading(false); return; }
    if (!date) { setError("La fecha es obligatoria."); setIsLoading(false); return; }
    if (selectedOffering?.capacity && peopleCount > selectedOffering.capacity) { setError(`Cupo máximo: ${selectedOffering.capacity} personas.`); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/reservas" : `/api/admin/reservas/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone, offering_id: offeringId, schedule_id: null, date, time, people_count: peopleCount, status, payment_status: paymentStatus, payment_id: null, total_amount: totalAmount, currency, notes, internal_notes: internalNotes }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/reservas"); router.refresh();
  }

  return (
    <div className="header-form-layout">
      <div className="menu-form-main">
        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="form-block"><h3>Cliente</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Nombre completo</span><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label>
              <label className="field"><span>Email</span><input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></label>
              <label className="field"><span>Teléfono</span><input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></label>
            </div>
          </section>

          <section className="form-block"><h3>Reserva</h3>
            <div className="grid-2">
              <label className="field span-2">
                <span>Actividad</span>
                <select value={offeringId} onChange={(e) => setOfferingId(e.target.value)}>
                  <option value="">Seleccionar actividad…</option>
                  {offerings.filter((o) => o.status === "published").map((o) => (
                    <option key={o.id} value={o.id}>{o.title} ({capLabels[o.type] || o.type})</option>
                  ))}
                </select>
                {selectedOffering ? <small className="muted" style={{ display: "block", marginTop: "0.25rem" }}>Tipo: {capLabels[selectedOffering.type]} {selectedOffering.capacity ? `· Cupo: ${selectedOffering.capacity}` : ""}</small> : null}
              </label>
              <label className="field"><span>Fecha</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label className="field"><span>Hora</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
              <label className="field"><span>Personas</span><input type="number" min={1} value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))} /></label>
              <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus)}>{RESERVATION_STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></label>
            </div>
          </section>

          <section className="form-block"><h3>Pago</h3>
            <div className="grid-2">
              <label className="field"><span>Estado del pago</span><select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as ReservationPaymentStatus)}>{RESERVATION_PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{payLabels[s]}</option>)}</select></label>
              <label className="field"><span>Total</span><input type="number" step="0.01" value={totalAmount ?? ""} onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : null)} /></label>
              <label className="field"><span>Moneda</span><select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            </div>
          </section>

          <section className="form-block"><h3>Notas</h3>
            <div className="grid-2">
              <label className="field span-2"><span>Notas del cliente</span><textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
              <label className="field span-2"><span>Notas internas</span><textarea rows={4} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Estas notas solo son visibles en el panel admin." /></label>
            </div>
          </section>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear reserva" : "Guardar cambios"}</button></div>
        </form>
      </div>

      <aside className="menu-preview-sidebar">
        <h3>Resumen</h3>
        <div className="menu-preview-box">
          <p className="auth-kicker">Cliente</p>
          <h4 style={{ margin: "0.3rem 0" }}>{customerName || "—"}</h4>
          {customerEmail ? <p className="muted" style={{ fontSize: "0.85rem" }}>{customerEmail}</p> : null}
          {customerPhone ? <p className="muted" style={{ fontSize: "0.85rem" }}>{customerPhone}</p> : null}
          <hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <p className="auth-kicker">Actividad</p>
          <p style={{ fontWeight: 500 }}>{selectedOffering?.title || "—"}</p>
          {selectedOffering ? <p className="muted" style={{ fontSize: "0.85rem" }}>{capLabels[selectedOffering.type]}</p> : null}
          <hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <p className="auth-kicker">Fecha y hora</p>
          <p style={{ fontWeight: 500 }}>{date || "—"} {time ? `· ${time}` : ""}</p>
          <hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <p className="auth-kicker">Personas</p>
          <p style={{ fontWeight: 500 }}>{peopleCount}</p>
          {totalAmount ? <><hr style={{ margin: "0.75rem 0", border: "none", borderTop: "1px solid var(--line)" }} /><p className="auth-kicker">Total</p><p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{totalAmount} {currency}</p></> : null}
        </div>
      </aside>
    </div>
  );
}
