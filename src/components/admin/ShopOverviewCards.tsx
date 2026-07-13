"use client";

export default function ShopOverviewCards({ stats }: { stats: { publishedProducts: number; lowStock: number; newOrders: number; totalSales: number } }) {
  return (
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
      <div className="stat-card"><p className="auth-kicker">Productos publicados</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{stats.publishedProducts}</p></div>
      <div className="stat-card"><p className="auth-kicker">Stock bajo</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600, color: stats.lowStock > 0 ? "var(--danger)" : undefined }}>{stats.lowStock}</p></div>
      <div className="stat-card"><p className="auth-kicker">Pedidos nuevos</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{stats.newOrders}</p></div>
      <div className="stat-card"><p className="auth-kicker">Ventas totales</p><p className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 600 }}>{stats.totalSales.toFixed(2)} €</p></div>
    </div>
  );
}
