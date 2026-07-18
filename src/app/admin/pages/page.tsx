import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import PagesTable from "@/components/admin/PagesTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getPages } from "@/lib/cms/pages";
import type { PageStatus, PageType } from "@/lib/cms/types";

const pageTypeFilters = ["all", "home", "studio", "contact", "faq", "privacy", "cookies", "legal", "custom"] as const;
const pageStatusFilters = ["all", "draft", "published", "archived"] as const;

const typeLabels: Record<(typeof pageTypeFilters)[number], string> = {
  all: "Todas",
  home: "Home",
  studio: "Estudio",
  contact: "Contacto",
  faq: "FAQ",
  privacy: "Privacidad",
  cookies: "Cookies",
  legal: "Legal",
  custom: "Custom",
};

const statusLabels: Record<(typeof pageStatusFilters)[number], string> = {
  all: "Todas",
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

type PageSearchParams = { q?: string; type?: string; status?: string };

function isTypeFilter(value: string | undefined): value is (typeof pageTypeFilters)[number] {
  return pageTypeFilters.includes(value as (typeof pageTypeFilters)[number]);
}

function isStatusFilter(value: string | undefined): value is (typeof pageStatusFilters)[number] {
  return pageStatusFilters.includes(value as (typeof pageStatusFilters)[number]);
}

export default async function PagesPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const params = await searchParams;
  const pages = await getPages();
  const query = params?.q?.trim() || "";
  const type = isTypeFilter(params?.type) ? params.type : "all";
  const status = isStatusFilter(params?.status) ? params.status : "all";
  const normalizedQuery = query.toLowerCase();
  const filtered = pages.filter((page) => {
    const matchesQuery = !normalizedQuery || `${page.title} ${page.slug}`.toLowerCase().includes(normalizedQuery);
    const matchesType = type === "all" || page.type === (type as PageType);
    const matchesStatus = status === "all" || page.status === (status as PageStatus);
    return matchesQuery && matchesType && matchesStatus && page.status !== "deleted";
  });
  const hasFilters = Boolean(query) || type !== "all" || status !== "all";

  return (
    <AdminShell>
      <div className="pages-admin-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Páginas</h2>
        </div>
        <Link className="primary-btn inline" href="/admin/pages/new">Nueva página</Link>
      </div>

      <form className="pages-admin-toolbar" action="/admin/pages">
        <label className="pages-search-field">
          <span>Buscar</span>
          <input name="q" defaultValue={query} placeholder="Título o slug" />
        </label>
        <label className="pages-select-field">
          <span>Tipo</span>
          <select name="type" defaultValue={type}>
            {pageTypeFilters.map((item) => (
              <option key={item} value={item}>{typeLabels[item]}</option>
            ))}
          </select>
        </label>
        <label className="pages-select-field">
          <span>Estado</span>
          <select name="status" defaultValue={status}>
            {pageStatusFilters.map((item) => (
              <option key={item} value={item}>{statusLabels[item]}</option>
            ))}
          </select>
        </label>
        <button className="secondary-btn pages-filter-submit" type="submit">Filtrar</button>
        {hasFilters ? <Link className="link-btn pages-filter-clear" href="/admin/pages">Limpiar</Link> : null}
      </form>

      {filtered.length ? <PagesTable pages={filtered} /> : (
        <SectionEmptyState title="Aún no hay páginas" description="Crea la primera página del sitio." actionHref="/admin/pages/new" actionLabel="Crear primera página" />
      )}
    </AdminShell>
  );
}
