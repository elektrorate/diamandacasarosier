import ShippingForm from "@/components/admin/ShippingForm";
import { getShippingMethods } from "@/lib/cms/shipping";

export default async function ShippingPage() { const items = await getShippingMethods(); return (<div className="page-card"><div className="page-header"><h2>Métodos de envío</h2><a className="secondary-btn" href="/admin/shop">Volver</a></div><ShippingForm items={items} /></div>); }
