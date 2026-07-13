import Link from "@/components/admin/AdminLink"; import AdminShell from "@/components/admin/AdminShell"; import TeachersTable from "@/components/admin/TeachersTable"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getTeachers } from "@/lib/cms/teachers";

export default async function Page({ searchParams }: { searchParams?: { status?: string } }) {
  const items = await getTeachers(); const status = searchParams?.status || "all";
  const filtered = items.filter((x) => (status === "all" || x.status === status) && x.status !== "deleted");
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>Teachers</h2></div><Link className="primary-btn inline" href="/admin/components/teachers/new">Crear profesor</Link></div>
    <div className="filters"><div className="filter-group">{["all","draft","published","archived"].map((s) => <Link key={s} className={s === status ? "chip active" : "chip"} href={`/admin/components/teachers?status=${s}`}>{s === "all" ? "Todos" : s === "draft" ? "Borrador" : s === "published" ? "Publicado" : "Archivado"}</Link>)}</div></div>
    {filtered.length ? <TeachersTable items={filtered} /> : <SectionEmptyState title="Aún no hay profesores" description="Crea el primer profesor." actionHref="/admin/components/teachers/new" actionLabel="Crear profesor" />}
  </AdminShell>);
}
