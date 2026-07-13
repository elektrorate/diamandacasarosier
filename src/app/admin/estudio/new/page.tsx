import AdminShell from "@/components/admin/AdminShell";
import TeacherForm from "@/components/admin/TeacherForm";

export default function NewStudioSpecialistPage() {
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nuevo especialista</h2></div></div><TeacherForm mode="create" basePath="/admin/estudio" /></AdminShell>);
}
