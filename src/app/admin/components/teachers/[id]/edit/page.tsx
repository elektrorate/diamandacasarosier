import AdminShell from "@/components/admin/AdminShell"; import TeacherForm from "@/components/admin/TeacherForm"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getTeacherById } from "@/lib/cms/teachers";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const item = await getTeacherById((await params).id);
  if (!item) return (<AdminShell><SectionEmptyState title="No encontrado" description="El profesor no existe." actionHref="/admin/components/teachers" actionLabel="Volver" /></AdminShell>);
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Editar profesor</h2></div></div><TeacherForm mode="edit" item={item} /></AdminShell>);
}
