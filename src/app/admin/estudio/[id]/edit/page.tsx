import AdminShell from "@/components/admin/AdminShell";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import TeacherForm from "@/components/admin/TeacherForm";
import { getTeacherById } from "@/lib/cms/teachers";

export default async function EditStudioSpecialistPage({ params }: { params: Promise<{ id: string }> }) {
  const item = await getTeacherById((await params).id);
  if (!item) return (<AdminShell><SectionEmptyState title="No encontrado" description="El especialista no existe." actionHref="/admin/estudio" actionLabel="Volver" /></AdminShell>);
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Editar especialista</h2></div></div><TeacherForm mode="edit" item={item} basePath="/admin/estudio" /></AdminShell>);
}
