import FormsTable from "@/components/admin/FormsTable";
import { getForms } from "@/lib/cms/forms";

export default async function FormulariosPage() {
  const items = await getForms();
  const active = items.filter((f) => f.status !== "deleted");
  return (
    <div className="page-card">
      <div className="page-header"><h2>Formularios</h2><a className="primary-btn" href="/admin/formularios/new">Nuevo formulario</a></div>
      {active.length === 0 ? <p className="muted">No hay formularios aún.</p> : <FormsTable items={active} />}
    </div>
  );
}
