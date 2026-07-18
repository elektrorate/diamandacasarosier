"use client";

import Link from "next/link";
import type { ShopItem } from "@/data/types";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { assetPath } from "@/lib/assets";
import { classNames } from "@/lib/utils";
import { ThumbnailGallery } from "@/components/ui/Carousel";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function ShopDetail({ item }: { item: ShopItem }) {
  const ctaLabel = item.ctaLabel || "Comprar";
  const ctaUrl = item.ctaUrl || "https://wa.me/34633788860";
  const externalCta = isExternalHref(ctaUrl);

  return (
    <section className="shop-detail section">
      <div className="container shop-detail__container">
        <div className="shop-detail__layout">
          <section className="shop-detail__media-column">
            <ThumbnailGallery
              items={item.gallery.length ? item.gallery : [item.image]}
              ariaLabel={`Galeria de ${item.name}`}
              className="shop-gallery"
              thumbsClassName="shop-gallery__thumbs"
              renderMain={(image) => (
                <img
                  className="shop-gallery__main"
                  src={assetPath(image ?? item.image)}
                  alt={item.name}
                />
              )}
              renderThumb={(image, index, isActive, select) => (
                  <button
                    className={classNames(
                      "shop-gallery__thumb",
                      isActive && "is-active"
                    )}
                    type="button"
                    aria-label={`Ver imagen ${index + 1} de ${item.name}`}
                    onClick={select}
                  >
                    <img
                      src={assetPath(image)}
                      alt={`${item.name} ${index + 1}`}
                    />
                  </button>
              )}
            />
            <div className="shop-sidecard">
              <h3>Disponibilidad</h3>
              <p>{item.availability}</p>
              <p>{item.availabilityNote}</p>
            </div>
          </section>

          <section className="shop-detail__content-column">
            <header className="shop-detail__head">
              <p className="shop-detail__eyebrow">{item.categoryLabel}</p>
              <h1 className="shop-detail__title">{item.name}</h1>
              <p className="shop-detail__price-main">{item.price}</p>
              <MarkdownContent className="shop-detail__highlight" source={item.description} />
            </header>
            <section className="shop-detail__facts">
              <div className="shop-detail__fact-block">
                <h2>Detalles tecnicos</h2>
                <div className="shop-detail__specs">
                  {Object.entries(item.details).map(([label, value]) => (
                    <div className="shop-detail__spec-row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shop-detail__fact-block">
                <h2>Estado</h2>
                <p className="shop-detail__duration">{item.availability}</p>
                <div className="shop-detail__schedule">
                  <div className="shop-detail__schedule-item">
                    <h4>Informacion</h4>
                    <p>{item.availabilityNote}</p>
                  </div>
                </div>
              </div>
            </section>
            <section className="shop-detail__text-block">
              <h2>La pieza</h2>
              <MarkdownContent source={item.description} />
            </section>
            <section className="shop-detail__cta">
              {externalCta ? (
                <a
                  className="shop-detail__button shop-detail__button--primary"
                  href={ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ctaLabel}
                </a>
              ) : (
                <Link className="shop-detail__button shop-detail__button--primary" href={ctaUrl}>
                  {ctaLabel}
                </Link>
              )}
            </section>
          </section>
        </div>
      </div>
    </section>
  );
}
