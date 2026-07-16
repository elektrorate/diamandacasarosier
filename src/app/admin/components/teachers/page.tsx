import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import TeachersTable from "@/components/admin/TeachersTable";
import { getTeachers } from "@/lib/cms/teachers";

type TeacherSearchParams = { status?: string };

export default async function Page({ searchParams }: { searchParams?: Promise<TeacherSearchParams> }) {
  const params = await searchParams;
  const items = await getTeachers();
  const status = params?.status || "all";
  const filtered = items.filter((item) => (status === "all" || item.status === status) && item.status !== "deleted");

  return (
    <AdminShell>
      <div className="section-head">
        <div><p className="auth-kicker">CMS</p><h2>Profesores</h2></div>
        <Link className="primary-btn inline" href="/admin/components/teachers/new">Crear profesor</Link>
      </div>
      <div className="filters">
        <div className="filter-group">
          {["all", "draft", "published", "archived"].map((item) => (
            <Link key={item} className={item === status ? "chip active" : "chip"} href={`/admin/components/teachers?status=${item}`}>
              {item === "all" ? "Todos" : item === "draft" ? "Borrador" : item === "published" ? "Publicado" : "Archivado"}
            </Link>
          ))}
        </div>
      </div>
      {filtered.length ? <TeachersTable items={filtered} /> : (
        <SectionEmptyState title="Aún no hay profesores" description="Crea el primer profesor." actionHref="/admin/components/teachers/new" actionLabel="Crear profesor" />
      )}
    </AdminShell>
  );
}
