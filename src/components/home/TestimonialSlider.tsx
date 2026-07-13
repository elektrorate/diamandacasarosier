"use client";

import { useEffect, useRef, useState } from "react";
import { Carousel } from "@/components/ui/Carousel";

export interface TestimonialSlide {
  image: string;
  alt: string;
  quote: string;
  author: string;
}

const defaultTestimonials: TestimonialSlide[] = [
  {
    image: "/img/avatar-1.jpg",
    alt: "Foto de Ana",
    quote:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem illo accusantium doloremque laudantium, totam rem aperiam.",
    author: "Ana — Hope River Artist"
  },
  {
    image: "/img/avatar-2.jpg",
    alt: "Foto de Marta",
    quote:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem illo accusantium doloremque laudantium, totam rem aperiam.",
    author: "Marta — Hope River Artist"
  },
  {
    image: "/img/avatar-3.jpg",
    alt: "Foto de Luis",
    quote:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem illo accusantium doloremque laudantium, totam rem aperiam.",
    author: "Luis — Hope River Artist"
  }
];

export function TestimonialSlider({
  testimonials = defaultTestimonials,
}: {
  testimonials?: TestimonialSlide[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = active === null ? null : testimonials[active];
  const testimonialCount = testimonials.length;

  useEffect(() => {
    if (active === null) return;
    document.body.classList.add("modal-open");
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") {
        setActive((value) =>
          value === null ? 0 : (value + 1) % testimonialCount
        );
      }
      if (event.key === "ArrowLeft") {
        setActive((value) =>
          value === null
            ? 0
            : (value - 1 + testimonialCount) % testimonialCount
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [active, testimonialCount]);

  if (testimonialCount === 0) return null;

  return (
    <>
      <section id="testimonio" className="testimonial section">
        <div className="container testimonial__container">
          <header className="testimonial__head">
            <h2 className="testimonial__title section-title">Lo que dicen</h2>
            <p className="testimonial__subtitle section-subtitle">
              Quienes han pasado por el taller
            </p>
          </header>
          <Carousel
            items={testimonials}
            ariaLabel="Testimonios de quienes han pasado por el taller"
            className="testimonial__carousel"
            viewportClassName="testimonial__viewport"
            trackClassName="testimonial__track"
            slideClassName="testimonial__slide"
            dotsClassName="testimonial__dots"
            dotClassName="testimonial__dot"
            showDots
            dotLabel={(slideIndex) => `Ver testimonio ${slideIndex + 1}`}
            getSlideProps={(_, { realIndex }) => ({
              tabIndex: 0,
              onClick: () => setActive(realIndex),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setActive(realIndex);
                }
              }
            })}
            renderItem={(testimonial) => (
              <>
                <img
                  className="testimonial__avatar"
                  src={testimonial.image}
                  alt={testimonial.alt}
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial__body">
                  <p className="testimonial__quote">{testimonial.quote}</p>
                  <p className="testimonial__author">{testimonial.author}</p>
                </div>
              </>
            )}
          />
        </div>
      </section>

      {current && (
        <div
          className="testimonial-modal is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tm-title"
        >
          <button
            className="testimonial-modal__backdrop"
            type="button"
            aria-label="Cerrar"
            onClick={() => setActive(null)}
          />
          <div
            className="testimonial-modal__panel"
            tabIndex={-1}
            ref={panelRef}
          >
            <div className="testimonial-modal__topbar">
              <button
                className="testimonial-modal__icon-btn"
                type="button"
                aria-label="Anterior"
                onClick={() =>
                  setActive(
                    ((active ?? 0) - 1 + testimonialCount) %
                      testimonialCount
                  )
                }
              >
                &lsaquo;
              </button>
              <button
                className="testimonial-modal__icon-btn"
                type="button"
                aria-label="Siguiente"
                onClick={() =>
                  setActive(
                    ((active ?? 0) + 1) % testimonialCount
                  )
                }
              >
                &rsaquo;
              </button>
              <button
                className="testimonial-modal__icon-btn testimonial-modal__icon-btn--close"
                type="button"
                aria-label="Cerrar"
                onClick={() => setActive(null)}
              >
                x
              </button>
            </div>
            <div className="testimonial-modal__content">
              <img
                className="testimonial-modal__avatar"
                src={current.image}
                alt={current.alt}
                loading="lazy"
                decoding="async"
              />
              <p className="testimonial-modal__quote">{current.quote}</p>
              <p className="testimonial-modal__author">{current.author}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
