import AdminShell from "@/components/admin/AdminShell"; import TeacherForm from "@/components/admin/TeacherForm";

export default function Page() { return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Nuevo profesor</h2></div></div><TeacherForm mode="create" /></AdminShell>); }
