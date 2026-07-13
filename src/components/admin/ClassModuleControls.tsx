import Link from "@/components/admin/AdminLink";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type FilterKey = "all" | "classes" | "works" | "priv";
type SortKey = "recent" | "old";

const filterLabels: Record<FilterKey, string> = {
  all: "Todos",
  classes: "Clases",
  works: "Works",
  priv: "Priv",
};

const sortLabels: Record<SortKey, string> = {
  recent: "Más recientes",
  old: "Más antiguos",
};

function buildHref(params: { q?: string; filter?: FilterKey; sort?: SortKey }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.filter && params.filter !== "all") search.set("filter", params.filter);
  if (params.sort && params.sort !== "recent") search.set("sort", params.sort);
  const query = search.toString();
  return query ? `/admin/clases?${query}` : "/admin/clases";
}

export default function ClassModuleControls() {
  const filter: FilterKey = "all";
  const sort: SortKey = "recent";

  return (
    <Card padding="md" className="mb-6">
      <form action="/admin/clases" method="get" className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/70">
            search
          </span>
          <input
            name="q"
            placeholder="Buscar..."
            className="block h-12 w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2.5 pl-11 pr-4 text-body-md text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-container"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(Object.entries(filterLabels) as [FilterKey, string][]).map(([key, label]) => (
            <Link
              key={key}
              href={buildHref({ filter: key, sort })}
              className={`rounded-full px-4 py-2 text-label-md font-semibold transition-colors ${
                filter === key
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container/20"
              }`}
            >
              {label}
            </Link>
          ))}
          <Button type="submit" variant="ghost" size="sm">Buscar</Button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-4">
        <span className="mr-1 text-label-md font-semibold text-on-surface-variant">Ordenar por:</span>
        {(Object.entries(sortLabels) as [SortKey, string][]).map(([key, label]) => (
          <Link
            key={key}
            href={buildHref({ filter, sort: key })}
            className={`rounded-full px-4 py-2 text-label-md font-semibold transition-colors ${
              sort === key
                ? "bg-secondary text-on-secondary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container/20"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
