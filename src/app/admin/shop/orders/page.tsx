import OrdersTable from "@/components/admin/OrdersTable";
import { getOrders } from "@/lib/cms/orders";

export default async function OrdersPage() { const items = await getOrders(); const active = items.filter((o) => o.status !== "deleted"); return (<div className="page-card"><div className="page-header"><h2>Pedidos</h2></div>{active.length === 0 ? <p className="muted">No hay pedidos.</p> : <OrdersTable items={active} />}</div>); }
