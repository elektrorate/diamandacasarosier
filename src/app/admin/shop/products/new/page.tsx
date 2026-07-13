import ProductForm from "@/components/admin/ProductForm";

export default function NewProduct() { return (<div className="page-card"><div className="page-header"><h2>Nuevo producto</h2><a className="secondary-btn" href="/admin/shop?tab=items">Volver</a></div><ProductForm mode="create" /></div>); }
