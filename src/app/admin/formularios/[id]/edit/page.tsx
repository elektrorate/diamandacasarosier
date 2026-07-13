import FormForm from "@/components/admin/FormForm";
import { getFormById } from "@/lib/cms/forms";
import { notFound } from "next/navigation";

export default async function EditFormulario({ params }: { params: Promise<{ id: string }> }) {
  const item = await getFormById((await params).id);
  if (!item) notFound();
  return (
    <div className="page-card">
      <div className="page-header"><h2>Editar: {item.name}</h2><a className="secondary-btn" href="/admin/formularios">Volver</a></div>
      <FormForm mode="edit" item={item} />
    </div>
  );
}
