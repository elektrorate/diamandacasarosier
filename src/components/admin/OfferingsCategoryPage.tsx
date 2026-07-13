import AdminShell from "@/components/admin/AdminShell";
import ClassOfferingsTable from "@/components/admin/ClassOfferingsTable";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getOfferings } from "@/lib/cms/offerings";
import type { OfferingType } from "@/lib/cms/types";

type SortKey = "recent" | "old";
type CategorySearchParams = { q?: string; sort?: string; page?: string };

const sortLabels: Record<SortKey, string> = {
  recent: "Más recientes",
  old: "Más antiguos",
};

const pageSize = 8;

function isSortKey(value: string): value is SortKey {
  return ["recent", "old"].includes(value);
}

function buildHref(basePath: string, params: { q?: string; sort?: SortKey; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "recent") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default async function OfferingsCategoryPage({
  title,
  subtitle,
  type,
  basePath,
  typeLabel,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  createLabel,
  searchParams,
}: {
  title: string;
  subtitle: string;
  type: OfferingType;
  basePath: string;
  typeLabel: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
  searchParams?: CategorySearchParams | Promise<CategorySearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const offerings = await getOfferings();
  const rawQuery = (resolvedSearchParams?.q ?? "").trim();
  const q = rawQuery.toLowerCase();
  const sort = isSortKey(resolvedSearchParams?.sort ?? "") ? resolvedSearchParams?.sort as SortKey : "recent";
  const page = Math.max(1, Number(resolvedSearchParams?.page ?? 1) || 1);

  const baseItems = offerings.filter((item) => item.type === type && !item.deleted_at && ["draft", "published"].includes(item.status));
  const items = baseItems
    .filter((item) => {
      const haystack = [item.title, item.slug, item.excerpt, item.type].join(" ").toLowerCase();
      return !q || haystack.includes(q);
    })
    .sort((a, b) => {
      const first = +new Date(a.updated_at || a.created_at);
      const second = +new Date(b.updated_at || b.created_at);
      return sort === "old" ? first - second : second - first;
    });

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasSearch = Boolean(q);

  return (
    <AdminShell>
      <TopBar
        title={title}
        subtitle={subtitle}
        actions={<Button href={`${basePath}/new`} icon="add">{createLabel}</Button>}
      />

      <Card padding="md" className="mb-6">
        <form method="get" className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <input type="hidden" name="sort" value={sort} />
          <input
            name="q"
            defaultValue={rawQuery}
            placeholder={`Buscar ${title.toLowerCase()}...`}
            className="block h-12 w-full rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-container"
          />

          <div className="flex items-center">
            <Button type="submit" variant="ghost" size="sm">Buscar</Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-4">
          <span className="mr-1 text-label-md font-semibold text-on-surface-variant">Ordenar por:</span>
          {(Object.entries(sortLabels) as [SortKey, string][]).map(([key, label]) => (
            <Button
              key={key}
              href={buildHref(basePath, { q: rawQuery, sort: key, page: 1 })}
              variant={sort === key ? "solid" : "ghost"}
              size="sm"
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {visible.length ? (
        <>
          <ClassOfferingsTable offerings={visible} basePath={basePath} typeLabel={typeLabel} />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            prevHref={currentPage > 1 ? buildHref(basePath, { q: rawQuery, sort, page: currentPage - 1 }) : undefined}
            nextHref={currentPage < totalPages ? buildHref(basePath, { q: rawQuery, sort, page: currentPage + 1 }) : undefined}
          />
        </>
      ) : (
        <EmptyState
          icon={emptyIcon}
          title={baseItems.length && hasSearch ? "No se encontraron resultados." : emptyTitle}
          description={baseItems.length && hasSearch ? "Prueba con otra búsqueda." : emptyDescription}
          action={<Button href={`${basePath}/new`} icon="add">{createLabel}</Button>}
        />
      )}
    </AdminShell>
  );
}
