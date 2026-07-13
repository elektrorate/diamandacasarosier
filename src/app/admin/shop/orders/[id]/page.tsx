import OrderDetail from "@/components/admin/OrderDetail";
import { getOrderById } from "@/lib/cms/orders";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) { const item = await getOrderById((await params).id); if (!item) notFound(); return <OrderDetail item={item} />; }
