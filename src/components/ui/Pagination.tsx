import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  prevHref?: string;
  nextHref?: string;
}

export default function Pagination({ page, totalPages, prevHref, nextHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <span className="text-label-md text-on-surface-variant">
        Página {page} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={prevHref ?? "#"}
          aria-disabled={!prevHref}
          className={`px-3 py-2 rounded-lg border border-outline-variant text-label-md transition-colors ${
            prevHref ? "text-on-surface hover:bg-surface-container-high" : "text-on-surface-variant/40 pointer-events-none"
          }`}
        >
          Anterior
        </Link>
        <Link
          href={nextHref ?? "#"}
          aria-disabled={!nextHref}
          className={`px-3 py-2 rounded-lg border border-outline-variant text-label-md transition-colors ${
            nextHref ? "text-on-surface hover:bg-surface-container-high" : "text-on-surface-variant/40 pointer-events-none"
          }`}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
}
