import CouponForm from "@/components/admin/CouponForm";
import { getCouponById } from "@/lib/cms/coupons";
import { notFound } from "next/navigation";

export default async function EditCoupon({ params }: { params: Promise<{ id: string }> }) { const item = await getCouponById((await params).id); if (!item) notFound(); return (<div className="page-card"><div className="page-header"><h2>Editar cupón: {item.code}</h2><a className="secondary-btn" href="/admin/shop/coupons">Volver</a></div><CouponForm mode="edit" item={item} /></div>); }
