import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/cms/products";
import { notFound } from "next/navigation";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) { const item = await getProductById((await params).id); if (!item) notFound(); return (<div className="page-card"><div className="page-header"><h2>Editar: {item.name}</h2><a className="secondary-btn" href="/admin/shop?tab=items">Volver</a></div><ProductForm mode="edit" item={item} /></div>); }
