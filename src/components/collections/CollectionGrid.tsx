import type { ExperienceItem } from "@/data/types";
import { CollectionCard } from "@/components/collections/CollectionCard";

export function CollectionGrid({
  items,
  lede
}: {
  items: readonly ExperienceItem[];
  lede: string;
}) {
  return (
    <section className="featured section">
      <div className="container featured__container">
        <header className="featured__head">
          <p className="featured__lede">{lede}</p>
        </header>
        <div className="featured__grid cards-grid">
          {items.map((item) => (
            <CollectionCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
