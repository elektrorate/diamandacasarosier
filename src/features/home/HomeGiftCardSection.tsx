import { GiftCarousel } from "@/components/home/GiftCarousel";
import type { GiftCardItem } from "@/data/types";

export function HomeGiftCardSection({
  items,
  title = "Experiencia en Ceramica",
  subtitle = "Regala una Gift Card"
}: {
  items: readonly GiftCardItem[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section id="gift-card" className="gift section">
      <div className="container gift__container">
        <header className="gift__head">
          <h2 className="gift__title section-title">{title}</h2>
          <p className="gift__subtitle section-subtitle">{subtitle}</p>
        </header>
        <GiftCarousel items={items} />
      </div>
    </section>
  );
}
