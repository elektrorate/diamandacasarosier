import LandingPagesTable from "@/components/admin/LandingPagesTable";
import { getLandingPages } from "@/lib/cms/landing-pages";

export default async function LandingPagesPage() {
  const items = await getLandingPages();
  return (
    <div className="page-card">
      <div className="page-header"><h2>Landing Pages</h2><a className="primary-btn" href="/admin/landing-pages/new">Nueva landing</a></div>
      {items.length === 0 ? <p className="muted">No hay landing pages aún. ¡Crea la primera!</p> : <LandingPagesTable items={items} />}
    </div>
  );
}
