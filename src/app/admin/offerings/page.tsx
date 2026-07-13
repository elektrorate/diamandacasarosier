import Link from "@/components/admin/AdminLink";
import AdminShell from "@/components/admin/AdminShell";
import OfferingsTable from "@/components/admin/OfferingsTable";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getOfferings } from "@/lib/cms/offerings";
import type { OfferingStatus, OfferingType } from "@/lib/cms/types";

const typeLabels: Record<"all" | OfferingType, string> = {
  all: "Todos",
  class: "Talleres",
  workshop: "Workshops",
  experience: "Experiences",
  gift_card: "Gift Cards",
};

const statusLabels: Record<"all" | OfferingStatus, string> = {
  all: "Todos",
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  deleted: "Papelera",
};

export default async function OfferingsPage({ searchParams }: { searchParams?: { type?: string; status?: string } }) {
  const offerings = await getOfferings();
  const type = (searchParams?.type as keyof typeof typeLabels) || "all";
  const status = (searchParams?.status as keyof typeof statusLabels) || "all";

  const filtered = offerings.filter((item) => {
    const matchesType = type === "all" || item.type === type;
    const matchesStatus = status === "all" || item.status === status;
    return matchesType && matchesStatus && item.status !== "deleted";
  });

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">Contenido comercial</p>
          <h2>Offerings</h2>
        </div>
        <Link className="primary-btn inline" href="/admin/offerings/new">
          Crear contenido
        </Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          {(["all", "class", "workshop", "experience", "gift_card"] as const).map((item) => (
            <Link key={item} className={item === type ? "chip active" : "chip"} href={`/admin/offerings?type=${item}&status=${status}`}>
              {typeLabels[item]}
            </Link>
          ))}
        </div>
        <div className="filter-group">
          {(["all", "draft", "published", "archived"] as const).map((item) => (
            <Link key={item} className={item === status ? "chip active" : "chip"} href={`/admin/offerings?type=${type}&status=${item}`}>
              {statusLabels[item]}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <OfferingsTable offerings={filtered} />
      ) : (
        <SectionEmptyState
          title="Aún no hay offerings"
          description="Crea el primer contenido comercial para empezar a poblar el CMS local."
          actionHref="/admin/offerings/new"
          actionLabel="Crear el primer contenido"
        />
      )}
    </AdminShell>
  );
}
