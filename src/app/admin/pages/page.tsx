import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import PagesTable from "@/components/admin/PagesTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getPages } from "@/lib/cms/pages";
import type { PageStatus, PageType } from "@/lib/cms/types";

const typeLabels: Record<"all" | PageType, string> = {
  all: "Todas", home: "Home", studio: "Estudio", contact: "Contacto",
  faq: "FAQ", privacy: "Privacidad", cookies: "Cookies", legal: "Legal", custom: "Custom",
};
const statusLabels: Record<"all" | PageStatus, string> = {
  all: "Todas", draft: "Borrador", published: "Publicado", archived: "Archivado", deleted: "Papelera",
};
type PageSearchParams = { type?: string; status?: string };

export default async function PagesPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const params = await searchParams;
  const pages = await getPages();
  const type = (params?.type as keyof typeof typeLabels) || "all";
  const status = (params?.status as keyof typeof statusLabels) || "all";
  const filtered = pages.filter((page) => {
    const matchesType = type === "all" || page.type === type;
    const matchesStatus = status === "all" || page.status === status;
    return matchesType && matchesStatus && page.status !== "deleted";
  });

  return (
    <AdminShell>
      <div className="section-head">
        <div><p className="auth-kicker">CMS</p><h2>Páginas</h2></div>
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
