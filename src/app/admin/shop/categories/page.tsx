import CategoriesTable from "@/components/admin/CategoriesTable";
import { getCategories } from "@/lib/cms/product-categories";

export default async function CategoriesPage() { const items = await getCategories(); const active = items.filter((c) => c.status !== "deleted"); return (<div className="page-card"><div className="page-header"><h2>Categorías</h2><a className="primary-btn" href="/admin/shop/categories/new">Nueva categoría</a></div>{active.length === 0 ? <p className="muted">No hay categorías aún.</p> : <CategoriesTable items={active} />}</div>); }
