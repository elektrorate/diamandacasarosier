import Link from "next/link";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { ExperienceItem } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { experienceHref } from "@/lib/routes";

export function CollectionCard({ item }: { item: ExperienceItem }) {
  const href = experienceHref(item.kind, item.slug);
  return (
    <article className="content-card classes-card">
      <Link className="content-card__media" href={href}>
        <img
          src={assetPath(item.coverImage)}
          alt={item.title}
          className={
            assetPath(item.coverImage) !== `/${item.coverImage}`
              ? "asset-fallback"
              : undefined
          }
        />
      </Link>
      <div className="content-card__body">
        <p className="content-card__meta">{item.category}</p>
        <h3 className="content-card__title card__title">{item.title}</h3>
        <MarkdownContent className="content-card__excerpt body-text" source={item.excerpt} />
        <Link className="content-card__cta" href={href}>
          leer mas
        </Link>
      </div>
    </article>
  );
}
