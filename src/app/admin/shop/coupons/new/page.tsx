import CouponForm from "@/components/admin/CouponForm";

export default function NewCoupon() { return (<div className="page-card"><div className="page-header"><h2>Nuevo cupón</h2><a className="secondary-btn" href="/admin/shop/coupons">Volver</a></div><CouponForm mode="create" /></div>); }
