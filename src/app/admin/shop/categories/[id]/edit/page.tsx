import CategoryForm from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/cms/product-categories";
import { notFound } from "next/navigation";

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) { const item = await getCategoryById((await params).id); if (!item) notFound(); return (<div className="page-card"><div className="page-header"><h2>Editar: {item.name}</h2><a className="secondary-btn" href="/admin/shop/categories">Volver</a></div><CategoryForm mode="edit" item={item} /></div>); }
