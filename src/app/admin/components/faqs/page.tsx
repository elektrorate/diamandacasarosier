import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import FaqsTable from "@/components/admin/FaqsTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getFaqs } from "@/lib/cms/faqs";

type FaqSearchParams = { status?: string; category?: string };

export default async function Page({ searchParams }: { searchParams?: Promise<FaqSearchParams> }) {
  const params = await searchParams;
  const items = await getFaqs();
  const status = params?.status || "all";
  const category = params?.category || "all";
  const filtered = items.filter((item) =>
    (status === "all" || item.status === status)
    && (category === "all" || item.category === category)
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
            <Link key={item} className={item === status ? "chip active" : "chip"} href={`/admin/components/faqs?status=${item}&category=${category}`}>
              {item === "all" ? "Todas" : item === "draft" ? "Borrador" : item === "published" ? "Publicado" : "Archivado"}
            </Link>
          ))}
        </div>
        <div className="filter-group">
          {["all", "general", "classes", "shop", "booking"].map((item) => (
            <Link key={item} className={item === category ? "chip active" : "chip"} href={`/admin/components/faqs?status=${status}&category=${item}`}>
              {item === "all" ? "Todas" : item === "general" ? "General" : item === "classes" ? "Clases" : item === "shop" ? "Shop" : "Reservas"}
            </Link>
          ))}
        </div>
      </div>
      {filtered.length ? <FaqsTable items={filtered} /> : (
        <SectionEmptyState title="Aún no hay FAQs" description="Crea la primera FAQ." actionHref="/admin/components/faqs/new" actionLabel="Crear FAQ" />
      )}
    </AdminShell>
  );
}
