import FormForm from "@/components/admin/FormForm";

export default function NewFormulario() {
  return (
    <div className="page-card">
      <div className="page-header"><h2>Nuevo formulario</h2><a className="secondary-btn" href="/admin/formularios">Volver</a></div>
      <FormForm mode="create" />
    </div>
  );
}
