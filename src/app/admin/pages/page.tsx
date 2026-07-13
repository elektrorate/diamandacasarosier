import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import PagesTable from "@/components/admin/PagesTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getPages } from "@/lib/cms/pages";
import type { PageType, PageStatus } from "@/lib/cms/types";

const typeLabels: Record<"all" | PageType, string> = {
  all: "Todas", home: "Home", studio: "Estudio", contact: "Contacto",
  faq: "FAQ", privacy: "Privacidad", cookies: "Cookies", legal: "Legal", custom: "Custom",
};
const statusLabels: Record<"all" | PageStatus, string> = {
  all: "Todas", draft: "Borrador", published: "Publicado", archived: "Archivado", deleted: "Papelera",
};

export default async function PagesPage({ searchParams }: { searchParams?: { type?: string; status?: string } }) {
  const pages = await getPages();
  const type = (searchParams?.type as keyof typeof typeLabels) || "all";
  const status = (searchParams?.status as keyof typeof statusLabels) || "all";

  const filtered = pages.filter((p) => {
    const matchesType = type === "all" || p.type === type;
    const matchesStatus = status === "all" || p.status === status;
    return matchesType && matchesStatus && p.status !== "deleted";
  });

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Pages</h2>
        </div>
        <Link className="primary-btn inline" href="/admin/pages/new">Crear página</Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          {(["all", "home", "studio", "contact", "faq", "privacy", "cookies", "legal", "custom"] as const).map((item) => (
            <Link key={item} className={item === type ? "chip active" : "chip"} href={`/admin/pages?type=${item}&status=${status}`}>{typeLabels[item]}</Link>
          ))}
        </div>
        <div className="filter-group">
          {(["all", "draft", "published", "archived"] as const).map((item) => (
            <Link key={item} className={item === status ? "chip active" : "chip"} href={`/admin/pages?type=${type}&status=${item}`}>{statusLabels[item]}</Link>
          ))}
        </div>
      </div>

      {filtered.length ? <PagesTable pages={filtered} /> : (
        <SectionEmptyState title="Aún no hay páginas" description="Crea la primera página del sitio." actionHref="/admin/pages/new" actionLabel="Crear primera página" />
      )}
    </AdminShell>
  );
}
