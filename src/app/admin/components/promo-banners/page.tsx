import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import PromoBannersTable from "@/components/admin/PromoBannersTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getPromoBanners } from "@/lib/cms/promo-banners";

const filterLabels: Record<string, string> = {
  all: "Todos",
  draft: "Borrador",
  published: "Publicado",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const items = await getPromoBanners();
  const rawStatus = (await searchParams)?.status;
  const status = rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";
  const visibleItems = items.filter((item) => !item.deleted_at && item.status !== "deleted");
  const filtered = visibleItems.filter((item) => status === "all" || item.status === status);
  const counts = {
    all: visibleItems.length,
    draft: visibleItems.filter((item) => item.status === "draft").length,
    published: visibleItems.filter((item) => item.status === "published").length,
  };

  return (
    <AdminShell>
      <div className="section-head promo-banners-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Banners promocionales</h2>
          <p className="muted">Activa un solo banner visible en el home. Al activar uno, el anterior pasa a borrador automáticamente.</p>
        </div>
        <Link className="primary-btn inline" href="/admin/components/promo-banners/new">
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Crear banner
        </Link>
      </div>

      <div className="filters promo-banners-filters">
        <div className="filter-group">
          {["all", "draft", "published"].map((key) => (
            <Link
              key={key}
              className={key === status ? "chip active" : "chip"}
              href={key === "all" ? "/admin/components/promo-banners" : `/admin/components/promo-banners?status=${key}`}
            >
              {filterLabels[key]} <span>{counts[key as keyof typeof counts]}</span>
            </Link>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <PromoBannersTable items={filtered} />
      ) : (
        <SectionEmptyState
          title="Aún no hay banners"
          description="Crea el primer banner promocional."
          actionHref="/admin/components/promo-banners/new"
          actionLabel="Crear banner"
        />
      )}
    </AdminShell>
  );
}
