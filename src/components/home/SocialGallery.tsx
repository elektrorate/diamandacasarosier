"use client";

import { useEffect, useRef, useState } from "react";
import { Carousel } from "@/components/ui/Carousel";

export interface SocialGalleryPost {
  image: string;
  title: string;
  body: string;
  date?: string;
  instagramUrl?: string;
}

export interface SocialGalleryProps {
  id?: string;
  title?: string;
  subtitle?: string;
  posts?: readonly SocialGalleryPost[];
  ariaLabel?: string;
  sourceHref?: string;
}

const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/casarosier";

export const defaultSocialGalleryPosts: readonly SocialGalleryPost[] = [
  {
    image: "/img/social-1.jpg",
    title: "Serie en proceso",
    body: "Pieza en estudio: pruebas de forma, secado y acabados de superficie.",
    date: "10 de enero de 2026"
  },
  {
    image: "/img/social-2.jpg",
    title: "Materia y ritmo",
    body: "Una mirada al proceso cotidiano dentro del taller.",
    date: "18 de enero de 2026"
  },
  {
    image: "/img/social-3.jpg",
    title: "Color y superficie",
    body: "Pruebas de esmaltes, capas y pequenas decisiones de acabado.",
    date: "24 de enero de 2026"
  },
  {
    image: "/img/social-4.jpeg",
    title: "El taller por dentro",
    body: "Herramientas, piezas y momentos de trabajo compartido.",
    date: "2 de febrero de 2026"
  }
];

export function SocialGallery({
  id = "galeria-social",
  title = "Y tu, cuando tuviste\ntu ultima idea?",
  subtitle = "siguenos en instagram - @casarosier",
  posts = defaultSocialGalleryPosts,
  ariaLabel = "Galeria continua de Instagram",
  sourceHref = DEFAULT_INSTAGRAM_URL
}: SocialGalleryProps = {}) {
  const [active, setActive] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const postCount = posts.length;
  const current = active === null ? null : posts[active];
  const currentLink =
    current?.instagramUrl?.trim() || sourceHref?.trim() || DEFAULT_INSTAGRAM_URL;

  useEffect(() => {
    if (active === null) return;
    document.body.classList.add("modal-open");
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") {
        setActive((value) =>
          value === null ? 0 : (value + 1) % postCount
        );
      }
      if (event.key === "ArrowLeft") {
        setActive((value) =>
          value === null ? 0 : (value - 1 + postCount) % postCount
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [active, postCount]);

  return (
    <>
      <section id={id} className="social section">
        <div className="container social__container">
          <header className="social__head">
            <h2 className="social__title section-title">
              {title.split("\n").map((line, index, lines) => (
                <span key={line}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="social__subtitle">
              {subtitle}
            </p>
          </header>
          <Carousel
            items={posts}
            ariaLabel={ariaLabel}
            className="social__carousel"
            viewportClassName="social__viewport"
            trackClassName="social__track is-animated"
            slideClassName="social__slide"
            marquee
            renderItem={(post, { realIndex, isDuplicate }) => (
                <button
                  className="social__item"
                  type="button"
                  onClick={() => setActive(realIndex)}
                  aria-label={`Abrir post social ${realIndex + 1}`}
                  tabIndex={isDuplicate ? -1 : undefined}
                >
                  <img
                    src={post.image}
                    alt={isDuplicate ? "" : `Post social ${realIndex + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
            )}
          />
        </div>
      </section>

      {current && (
        <div
          className="ig-modal is-open"
          id="ig-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ig-title"
        >
          <button
            className="ig-modal__backdrop"
            type="button"
            aria-label="Cerrar"
            onClick={() => setActive(null)}
          />
          <div className="ig-modal__panel" tabIndex={-1} ref={panelRef}>
            <section className="ig-modal__media">
              <img src={current.image} alt="" loading="lazy" decoding="async" />
              <div className="ig-modal__overlay-text">Post</div>
            </section>
            <section className="ig-modal__content">
              <div className="ig-modal__topbar">
                <div className="ig-modal__nav-actions" aria-label="Navegacion de galeria">
                  <button
                    className="ig-modal__icon-btn ig-modal__icon-btn--prev"
                    type="button"
                    aria-label="Anterior"
                    onClick={() =>
                      setActive(
                        ((active ?? 0) - 1 + posts.length) % posts.length
                      )
                    }
                  >
                    <span
                      className="ig-modal__arrow-mark ig-modal__arrow-mark--prev"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    className="ig-modal__icon-btn ig-modal__icon-btn--next"
                    type="button"
                    aria-label="Siguiente"
                    onClick={() =>
                      setActive(((active ?? 0) + 1) % posts.length)
                    }
                  >
                    <span
                      className="ig-modal__arrow-mark ig-modal__arrow-mark--next"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <button
                  className="ig-modal__icon-btn ig-modal__icon-btn--close"
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setActive(null)}
                >
                  <span className="ig-modal__close-mark" aria-hidden="true" />
                </button>
              </div>
              <h3 id="ig-title" className="ig-modal__title">
                {current.title}
              </h3>
              <div className="ig-modal__body">{current.body}</div>
              {current.date ? <p className="ig-modal__date">{current.date}</p> : null}
              {currentLink ? (
                <a
                  className="ig-modal__link"
                  href={currentLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Ver post en Instagram"
                >
                  <img src="/img/icon-instagram.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                  Ver en Instagram
                </a>
              ) : null}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
