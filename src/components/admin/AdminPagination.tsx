"use client";

type PaginationItem = number | "ellipsis";

function buildPages(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 4) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
    pages.add(5);
  }
  if (currentPage >= totalPages - 3) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
    pages.add(totalPages - 4);
  }

  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export default function AdminPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const safeTotal = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotal);
  const pages = buildPages(safePage, safeTotal);

  return (
    <nav className="admin-pagination" aria-label="Paginación">
      <button
        type="button"
        className="admin-pagination__item admin-pagination__arrow"
        disabled={disabled || safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="Página anterior"
      >
        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      </button>
      {pages.map((item, index) => (
        item === "ellipsis" ? (
          <span className="admin-pagination__ellipsis" key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            type="button"
            key={item}
            className={`admin-pagination__item${item === safePage ? " is-active" : ""}`}
            disabled={disabled || item === safePage}
            onClick={() => onPageChange(item)}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item}
          </button>
        )
      ))}
      <button
        type="button"
        className="admin-pagination__item admin-pagination__arrow"
        disabled={disabled || safePage >= safeTotal}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="Página siguiente"
      >
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </button>
    </nav>
  );
}
