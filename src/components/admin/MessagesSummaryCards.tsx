"use client";

export default function MessagesSummaryCards({ items }: { items: { status: string }[] }) {
  const counts = { new: 0, read: 0, replied: 0, archived: 0 };
  items.forEach((i) => { if (i.status in counts) (counts as Record<string, number>)[i.status]++; });
  return (
    <div className="stats-grid messages-summary-grid">
      <div className="stat-card"><p className="auth-kicker">Nuevos</p><p className="stat-value">{counts.new}</p></div>
      <div className="stat-card"><p className="auth-kicker">Leídos</p><p className="stat-value">{counts.read}</p></div>
      <div className="stat-card"><p className="auth-kicker">Respondidos</p><p className="stat-value">{counts.replied}</p></div>
      <div className="stat-card"><p className="auth-kicker">Archivados</p><p className="stat-value">{counts.archived}</p></div>
    </div>
  );
}
