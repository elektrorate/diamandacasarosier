"use client";

export default function ReservationsSummaryCards({ items }: { items: { status: string }[] }) {
  const counts = { pending: 0, confirmed: 0, paid: 0, cancelled: 0 };
  items.forEach((i) => { if (i.status in counts) counts[i.status as keyof typeof counts]++; });
  return (
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
      <div className="stat-card"><p className="auth-kicker">Pendientes</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{counts.pending}</p></div>
      <div className="stat-card"><p className="auth-kicker">Confirmadas</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{counts.confirmed}</p></div>
      <div className="stat-card"><p className="auth-kicker">Pagadas</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{counts.paid}</p></div>
      <div className="stat-card"><p className="auth-kicker">Canceladas</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{counts.cancelled}</p></div>
    </div>
  );
}
