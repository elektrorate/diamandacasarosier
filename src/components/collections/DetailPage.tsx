"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accordion } from "@/components/collections/Accordion";
import { Gallery } from "@/components/collections/Gallery";
import { MarkdownContent, renderInlineMarkdown } from "@/components/ui/MarkdownContent";
import type { ExperienceItem } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { addCartItem } from "@/lib/cart";

function includedText(value: string) {
  return value.replace(/^\s*(?:[-*]\s+|\d+\.\s+)/, "");
}

function hasMeaningfulContent(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : [value ?? ""];
  return values.some((entry) => entry.trim().length > 0);
}

function hasMeaningfulProgramItem(item: ExperienceItem["program"][number]) {
  return (
    hasMeaningfulContent(item.title) ||
    hasMeaningfulContent(item.content) ||
    (item.points?.some((point) => hasMeaningfulContent(point)) ?? false)
  );
}
export function DetailPage({
  item,
  titleLevel = "h1",
}: {
  item: ExperienceItem;
  titleLevel?: "h1" | "h2";
}) {
  const DetailTitle = titleLevel;
  const isGiftCard = item.kind === "gift-card";
  const consultHref = item.ctaConsultHref || item.ctaHref;
  const enrollHref = item.ctaEnrollHref || "";
  const consultLabel = item.ctaConsultLabel || (isGiftCard ? "Comprar" : "Consultar");
  const enrollLabel = item.ctaEnrollLabel || (isGiftCard ? "Anadir al carrito" : "Inscribirme");
  const [added, setAdded] = useState(false);
  const programItems = item.program.filter(hasMeaningfulProgramItem);
  const showProgram = item.showModulesSection && programItems.length > 0;
  const showIncluded = item.showIncludedSection && hasMeaningfulContent(item.included);
  const hasLearningContent = item.showLearningSection && hasMeaningfulContent(item.whatYouWillLearn);
  const hasParticipationContent = item.showParticipationSection && hasMeaningfulContent(item.whoCanJoin);
  const showPaymentMethods = item.showPaymentMethodsSection && item.paymentMethods.length > 0;
  const hasSideContent = Boolean(
    item.videoUrl ||
    item.videoCardImage ||
    showPaymentMethods ||
    item.additionalInfo.trim()
  );
  const defaultPrice = useMemo(
    () =>
      item.priceOptions.length <= 1
        ? item.priceOptions[0]?.price ?? ""
        : item.priceOptions
            .map((option) => `${option.label}: ${option.price}`)
            .join(" / "),
    [item.priceOptions]
  );

  const addGiftCard = () => {
    addCartItem({
      cartItemId: `${item.id}-${Date.now()}`,
      productId: item.id,
      slug: item.slug,
      kind: item.kind,
      title: item.title,
      subtitle: item.subtitle,
      price: defaultPrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
    setAdded(true);
  };

  return (
    <section className="class-detail section">
      <div className="container class-detail__container">
        <div className="class-detail__layout">
          <section className="class-detail__media-column">
            <Gallery
              images={item.galleryImages}
              title={item.title}
              videoImage={item.videoCardImage}
              videoLabel={item.videoCardLabel}
              ctaHref={item.videoUrl}
              showVideo={false}
            />

            {hasSideContent ? (
              <aside className="class-detail__side-column">
              {item.videoUrl ? (
                <a
                  className="class-gallery__video-card"
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.videoCardImage ? <img src={assetPath(item.videoCardImage)} alt={item.title} /> : null}
                  <span>{item.videoCardLabel || "VIDEO"}</span>
                </a>
              ) : item.videoCardImage ? (
                <div className="class-gallery__video-card">
                  <img src={assetPath(item.videoCardImage)} alt={item.title} />
                  <span>{item.videoCardLabel || "IMAGEN"}</span>
                </div>
              ) : null}
              {showPaymentMethods ? (
                <div className="class-sidecard">
                  <h3>Metodos de pago</h3>
                  <p>Puedes pagar con cualquiera de estos medios</p>
                  <ul>
                    {item.paymentMethods.map((method) => (
                      <li key={method}>{method}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {item.additionalInfo.trim() ? (
                <div className="class-sidecard class-sidecard--soft">
                  <h3>Informacion adicional</h3>
                  <MarkdownContent source={item.additionalInfo} />
                </div>
              ) : null}
              </aside>
            ) : null}
          </section>

          <section className="class-detail__content-column">
            <header className="class-detail__head">
              <DetailTitle className="class-detail__title">{item.subtitle}</DetailTitle>
              <p className="class-detail__question">
                Te apasiona la creatividad y deseas explorar el mundo de la
                ceramica?
              </p>
              <MarkdownContent source={item.introHighlight} className="class-detail__highlight" />
            </header>

            <MarkdownContent source={item.description} className="class-detail__copy" />

            <section className="class-detail__info-column">
              <section className="class-detail__facts">
                <div className="class-detail__fact-block">
                  <h2>Precio</h2>
                  <div className="class-detail__price-list">
                    {item.priceOptions.map((option) => (
                      <div
                        className="class-detail__price-row"
                        key={option.label}
                      >
                        <span>{option.label}</span>
                        <strong>{option.price}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="class-detail__fact-block">
                  <h2>Duracion</h2>
                  <p className="class-detail__duration">{item.duration}</p>
                  {item.schedule.length ? (
                    <div className="class-detail__schedule">
                      {item.schedule.map((schedule) => (
                        <div
                          className="class-detail__schedule-item"
                          key={schedule.day}
                        >
                          <h4>{schedule.day}</h4>
                          {schedule.slots.map((slot) => (
                            <p key={slot}>{slot}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              {showIncluded || consultHref ? (
                <section className="class-detail__includes">
                  {showIncluded ? (
                    <>
                      <h2>Incluye</h2>
                      <ul>
                        {item.included.map((included) => (
                          <li key={included}>{renderInlineMarkdown(includedText(included))}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {consultHref ? (
                    <a
                      className="class-detail__button"
                      href={consultHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {consultLabel}
                    </a>
                  ) : null}
                </section>
              ) : null}

              {hasLearningContent ? (
                <section className="class-detail__text-block">
                  <h2>{item.learningSectionTitle || "¿Qué aprenderás?"}</h2>
                  <MarkdownContent source={item.whatYouWillLearn} />
                </section>
              ) : null}

              {hasParticipationContent ? (
                <section className="class-detail__text-block">
                  <h2>{item.participationSectionTitle || "¿Quién puede participar?"}</h2>
                  <MarkdownContent source={item.whoCanJoin} />
                </section>
              ) : null}

              {showProgram || (isGiftCard && enrollHref) ? (
                <section className="class-detail__program">
                  {showProgram ? (
                    <>
                      <h2>{item.programSectionTitle || "Contenido del curso"}</h2>
                      <Accordion items={programItems} />
                    </>
                  ) : null}
                  {isGiftCard && enrollHref ? (
                    <>
                      <button
                        className="class-detail__button class-detail__button--primary"
                        type="button"
                        onClick={addGiftCard}
                      >
                        {enrollLabel}
                      </button>
                      {added && (
                        <div className="gift-card-cart-feedback">
                          <p className="gift-card-cart-feedback__message">
                            Gift card anadida al carrito.
                          </p>
                          <div className="gift-card-cart-feedback__summary">
                            <div className="gift-card-cart-feedback__row">
                              <span>Producto</span>
                              <strong>{item.title}</strong>
                            </div>
                            {defaultPrice && (
                              <div className="gift-card-cart-feedback__row">
                                <span>Precio</span>
                                <strong>{defaultPrice}</strong>
                              </div>
                            )}
                          </div>
                          <Link className="class-detail__button" href="/carrito">
                            Ver carrito
                          </Link>
                        </div>
                      )}
                    </>
                  ) : enrollHref ? (
                    <a
                      className="class-detail__button class-detail__button--primary"
                      href={enrollHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {enrollLabel}
                    </a>
                  ) : null}
                </section>
              ) : null}
            </section>
          </section>
        </div>
      </div>
    </section>
  );
}
