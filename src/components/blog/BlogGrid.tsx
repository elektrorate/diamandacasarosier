"use client";

import Link from "next/link";
import { useState } from "react";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { BlogPost } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { classNames, formatDate } from "@/lib/utils";

export function BlogGrid({
  posts,
  categories
}: {
  posts: readonly BlogPost[];
  categories: string[];
}) {
  const [category, setCategory] = useState("all");
  const filtered =
    category === "all"
      ? posts
      : posts.filter((post) => post.category === category);

  return (
    <>
      <div className="blog-filters">
        {[
          { label: "Todo", value: "all" },
          ...categories.map((value) => ({ label: value, value }))
        ].map((filter) => (
          <button
            type="button"
            className={classNames(
              "blog-filter",
              category === filter.value && "is-active"
            )}
            aria-pressed={category === filter.value}
            onClick={() => setCategory(filter.value)}
            key={filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="blog-grid">
        {filtered.map((post) => (
          <article className="blog-card" key={post.id}>
            <Link className="blog-card__media" href={`/blog/${post.slug}`}>
              <img src={assetPath(post.coverImage)} alt={post.title} />
            </Link>
            <div className="blog-card__body">
              <p className="blog-card__category">{post.category}</p>
              <h2 className="blog-card__title">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <MarkdownContent className="blog-card__excerpt" source={post.excerpt} />
              <div className="blog-card__meta">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <Link className="blog-card__link" href={`/blog/${post.slug}`}>
                  leer mas
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="blog-empty">Todavia no hay articulos publicados.</p>
      )}
    </>
  );
}
