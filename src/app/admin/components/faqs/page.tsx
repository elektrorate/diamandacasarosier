import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import FaqsTable from "@/components/admin/FaqsTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getFaqGroups, getFaqs } from "@/lib/cms/faqs";

type FaqSearchParams = { status?: string; group?: string };

export default async function Page({ searchParams }: { searchParams?: Promise<FaqSearchParams> }) {
  const params = await searchParams;
  const [items, groups] = await Promise.all([getFaqs(), getFaqGroups()]);
  const status = params?.status || "all";
  const group = params?.group || "all";
  const filtered = items.filter((item) =>
    (status === "all" || item.status === status)
    && (group === "all" || item.faq_group_id === group)
    && item.status !== "deleted",
  );

  return (
    <AdminShell>
      <div className="section-head">
        <div><p className="auth-kicker">CMS</p><h2>FAQs</h2></div>
        <Link className="primary-btn inline" href="/admin/components/faqs/new">Crear FAQ</Link>
      </div>
      <div className="filters">
        <div className="filter-group">
          {["all", "draft", "published", "archived"].map((item) => (
            <Link key={item} className={item === status ? "chip active" : "chip"} href={"/admin/components/faqs?status=" + item + "&group=" + group}>
              {item === "all" ? "Todas" : item === "draft" ? "Borrador" : item === "published" ? "Publicado" : "Archivado"}
            </Link>
          ))}
        </div>
        <div className="filter-group">
          <Link className={group === "all" ? "chip active" : "chip"} href={"/admin/components/faqs?status=" + status + "&group=all"}>Todos los grupos</Link>
          {groups.filter((item) => item.status !== "deleted").map((item) => (
            <Link key={item.id} className={item.id === group ? "chip active" : "chip"} href={"/admin/components/faqs?status=" + status + "&group=" + item.id}>
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      {filtered.length ? <FaqsTable items={filtered} groups={groups} /> : (
        <SectionEmptyState title="Aún no hay FAQs" description="Crea la primera pregunta dentro de un grupo FAQ." actionHref="/admin/components/faqs/new" actionLabel="Crear FAQ" />
      )}
    </AdminShell>
  );
}
