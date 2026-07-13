import Link from "@/components/admin/AdminLink"; import AdminShell from "@/components/admin/AdminShell"; import FaqsTable from "@/components/admin/FaqsTable"; import SectionEmptyState from "@/components/admin/SectionEmptyState"; import { getFaqs } from "@/lib/cms/faqs";

export default async function Page({ searchParams }: { searchParams?: { status?: string; category?: string } }) {
  const items = await getFaqs(); const status = searchParams?.status || "all"; const cat = searchParams?.category || "all";
  const filtered = items.filter((x) => (status === "all" || x.status === status) && (cat === "all" || x.category === cat) && x.status !== "deleted");
  return (<AdminShell><div className="section-head"><div><p className="auth-kicker">CMS</p><h2>FAQs</h2></div><Link className="primary-btn inline" href="/admin/components/faqs/new">Crear FAQ</Link></div>
    <div className="filters"><div className="filter-group">{["all","draft","published","archived"].map((s) => <Link key={s} className={s === status ? "chip active" : "chip"} href={`/admin/components/faqs?status=${s}&category=${cat}`}>{s === "all" ? "Todas" : s === "draft" ? "Borrador" : s === "published" ? "Publicado" : "Archivado"}</Link>)}</div>
    <div className="filter-group">{["all","general","classes","shop","booking"].map((c) => <Link key={c} className={c === cat ? "chip active" : "chip"} href={`/admin/components/faqs?status=${status}&category=${c}`}>{c === "all" ? "Todas" : c === "general" ? "General" : c === "classes" ? "Clases" : c === "shop" ? "Shop" : "Reservas"}</Link>)}</div></div>
    {filtered.length ? <FaqsTable items={filtered} /> : <SectionEmptyState title="Aún no hay FAQs" description="Crea la primera FAQ." actionHref="/admin/components/faqs/new" actionLabel="Crear FAQ" />}
  </AdminShell>);
}
