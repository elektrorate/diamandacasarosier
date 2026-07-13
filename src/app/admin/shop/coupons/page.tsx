import CouponsTable from "@/components/admin/CouponsTable";
import { getCoupons } from "@/lib/cms/coupons";

export default async function CouponsPage() { const items = await getCoupons(); const active = items.filter((c) => c.status !== "deleted"); return (<div className="page-card"><div className="page-header"><h2>Cupones</h2><a className="primary-btn" href="/admin/shop/coupons/new">Nuevo cupón</a></div>{active.length === 0 ? <p className="muted">No hay cupones.</p> : <CouponsTable items={active} />}</div>); }
