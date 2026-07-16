import Link from "next/link";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { ExperienceItem } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { experienceHref } from "@/lib/routes";

interface FeaturedSectionProps {
  id: string;
  title: string;
  subtitle: string;
  items: readonly ExperienceItem[];
  variant?: string;
}

export function FeaturedSection({
  id,
  title,
  subtitle,
  items,
  variant
}: FeaturedSectionProps) {
  return (
    <section
      id={id}
      className={`featured section ${variant ? `featured--${variant}` : ""}`}
    >
      <div className="container featured__container">
        <header className="featured__head">
          <h2 className="featured__title section-title">{title}</h2>
          <p className="featured__subtitle section-subtitle">{subtitle}</p>
        </header>
        <div className="featured__grid cards-grid">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <Link
                className="content-card__media"
                href={experienceHref(item.kind, item.slug)}
              >
                <img
                  src={assetPath(item.homeImage || item.coverImage)}
                  alt={item.homeImageAlt || item.homeTitle || item.title}
                  loading="lazy"
                  decoding="async"
                  className={
                    assetPath(item.homeImage || item.coverImage) !== `/${item.homeImage || item.coverImage}`
                      ? "asset-fallback"
                      : undefined
                  }
                />
              </Link>
              <div className="content-card__body">
                <p className="content-card__meta">{item.homeEyebrow || item.category}</p>
                <h3 className="content-card__title card__title">
                  {item.homeTitle || item.title}
                </h3>
                <MarkdownContent className="content-card__excerpt body-text" source={item.homeExcerpt || item.excerpt} />
                <Link
                  className="content-card__cta"
                  href={experienceHref(item.kind, item.slug)}
                >
                  leer mas
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
