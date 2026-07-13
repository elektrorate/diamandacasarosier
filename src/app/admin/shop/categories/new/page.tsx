import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategory() { return (<div className="page-card"><div className="page-header"><h2>Nueva categoría</h2><a className="secondary-btn" href="/admin/shop/categories">Volver</a></div><CategoryForm mode="create" /></div>); }
