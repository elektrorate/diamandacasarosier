"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { ExperienceItem } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { experienceHref } from "@/lib/routes";
import { Carousel } from "@/components/ui/Carousel";

interface GiftCarouselProps {
  items: readonly ExperienceItem[];
}

function giftHomeContent(item: ExperienceItem) {
  return {
    image: item.homeImage || item.coverImage,
    imageAlt: item.homeImageAlt || item.homeTitle || item.title,
    eyebrow: item.homeEyebrow || item.subtitle || item.category,
    title: item.homeTitle || item.title,
    excerpt: item.homeExcerpt || item.excerpt,
  };
}

function GiftCard({ item }: { item: ExperienceItem }) {
  const content = giftHomeContent(item);
  const href = experienceHref(item.kind, item.slug);

  return (
    <Link className="gift-carousel__card-link" href={href} aria-label={`Ver ${content.title}`}>
      <span className="gift-carousel__media">
        <img
          src={assetPath(content.image)}
          alt={content.imageAlt}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="gift-carousel__body">
        {content.eyebrow ? <span className="gift-carousel__eyebrow">{content.eyebrow}</span> : null}
        <span className="gift-carousel__title">{content.title}</span>
        <MarkdownContent className="gift-carousel__text" source={content.excerpt} />
        <span className="gift-carousel__cta" aria-hidden="true">
          ver mas
        </span>
      </span>
    </Link>
  );
}

export function GiftCarousel({ items }: GiftCarouselProps) {
  if (items.length === 0) return null;
  const singleItem = items[0];

  if (items.length === 1 && singleItem) {
    return (
      <article className="gift-carousel gift-carousel--single">
        <GiftCard item={singleItem} />
      </article>
    );
  }

  return (
    <Carousel
      items={items}
      ariaLabel="Experiencias en ceramica"
      className="gift-carousel"
      viewportClassName="gift-carousel__viewport"
      trackClassName="gift-carousel__track"
      slideClassName="gift-carousel__slide"
      arrowClassName="gift-carousel__arrow"
      previousArrowClassName="gift-carousel__arrow--prev"
      nextArrowClassName="gift-carousel__arrow--next"
      previousLabel="Experiencia anterior"
      nextLabel="Experiencia siguiente"
      showArrows
      renderItem={(item) => <GiftCard item={item} />}
    />
  );
}
