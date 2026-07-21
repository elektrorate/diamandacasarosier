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
          {items.map((item) => {
            const href = experienceHref(item.kind, item.slug);
            const image = item.homeImage || item.coverImage;

            return (
              <article className="content-card" key={item.id}>
                <Link className="content-card__link" href={href} aria-label={`Ver ${item.homeTitle || item.title}`}>
                  <span className="content-card__media">
                    <img
                      src={assetPath(image)}
                      alt={item.homeImageAlt || item.homeTitle || item.title}
                      loading="lazy"
                      decoding="async"
                      className={assetPath(image) !== `/${image}` ? "asset-fallback" : undefined}
                    />
                  </span>
                  <span className="content-card__body">
                    <span className="content-card__meta">{item.homeEyebrow || item.category}</span>
                    <span className="content-card__title card__title">
                      {item.homeTitle || item.title}
                    </span>
                    <MarkdownContent className="content-card__excerpt body-text" source={item.homeExcerpt || item.excerpt} />
                    <span className="content-card__cta" aria-hidden="true">
                      leer mas
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
