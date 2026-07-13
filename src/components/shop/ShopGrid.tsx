"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShopItem } from "@/data/types";
import { assetPath } from "@/lib/assets";

const PAGE_SIZE = 9;

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

export function ShopGrid({
  published,
}: {
  published: ShopItem[];
  shopCategories?: unknown;
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(published.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const items = published.slice(startIndex, startIndex + PAGE_SIZE);
  const showPagination = published.length > PAGE_SIZE;
  const pages = buildPages(safePage, totalPages);

  return (
    <section className="shop-listing section">
      <div className="container shop-listing__container">
        <div className="cards-grid shop-grid">
          {items.map((item) => (
            <article
              className="content-card classes-card shop-card"
              key={item.id}
            >
              <Link
                className="content-card__media shop-card__media"
                href={`/shop/${item.slug}`}
                aria-label={`Ver pieza ${item.name}`}
              >
                <img src={assetPath(item.image)} alt={item.name} />
              </Link>
              <div className="content-card__body shop-card__body">
                <p className="content-card__meta shop-card__meta">
                  {item.categoryLabel}
                </p>
                <h3 className="content-card__title card__title">{item.name}</h3>
                <div className="shop-card__facts">
                  <p className="shop-card__price">{item.price}</p>
                  <p className="shop-card__availability">
                    {item.availability}
                  </p>
                </div>
                <Link
                  className="content-card__cta shop-card__cta"
                  href={`/shop/${item.slug}`}
                >
                  Ver pieza
                </Link>
              </div>
            </article>
          ))}
        </div>

        {showPagination ? (
          <nav className="shop-pagination" aria-label="Paginación de shop">
            <button
              type="button"
              className="shop-pagination__item shop-pagination__arrow"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            {pages.map((item, index) => (
              item === "ellipsis" ? (
                <span className="shop-pagination__ellipsis" key={`ellipsis-${index}`}>...</span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={`shop-pagination__item${item === safePage ? " is-active" : ""}`}
                  disabled={item === safePage}
                  onClick={() => setPage(item)}
                  aria-current={item === safePage ? "page" : undefined}
                >
                  {item}
                </button>
              )
            ))}
            <button
              type="button"
              className="shop-pagination__item shop-pagination__arrow"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              aria-label="Página siguiente"
            >
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}