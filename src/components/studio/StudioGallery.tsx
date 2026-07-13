"use client";

import { useEffect, useRef, useState } from "react";

const images = [
  ["/img/intro-a.jpg", "Mesa de trabajo del estudio de ceramica"],
  ["/img/intro-b.jpg", "Herramientas y piezas en proceso"],
  ["/img/intro-c.jpg", "Zona de torno del taller"],
  ["/img/intro-d.jpg", "Piezas de ceramica en proceso"],
  ["/img/intro-e.jpg", "Materiales y esmaltes del taller"],
  ["/img/workshop-2.jpg", "Detalle del espacio de trabajo"]
] as const;

export function StudioGallery() {
  const [active, setActive] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active === null) return;
    document.body.classList.add("modal-open");
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <section className="studio-gallery section">
        <div className="container studio-gallery__container">
          <header className="studio-gallery__head">
            <h2>El taller por dentro</h2>
            <p>
              Mesas de trabajo, piezas en proceso, herramientas, esmaltes y
              pequenos momentos del dia a dia.
            </p>
          </header>
          <div className="studio-gallery__grid">
            {images.map(([src, alt], index) => (
              <figure className="studio-gallery__item" key={src}>
                <button
                  className="studio-gallery__trigger"
                  type="button"
                  aria-label={`Ampliar imagen: ${alt}`}
                  onClick={() => setActive(index)}
                >
                  <img src={src} alt={alt} />
                </button>
              </figure>
            ))}
          </div>
        </div>
      </section>
      {active !== null && (
        <div
          className="studio-lightbox is-open"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada del estudio"
        >
          <button
            className="studio-lightbox__backdrop"
            type="button"
            aria-label="Cerrar imagen"
            onClick={() => setActive(null)}
          />
          <button
            className="studio-lightbox__close"
            type="button"
            aria-label="Cerrar imagen"
            onClick={() => setActive(null)}
          >
            x
          </button>
          <div
            className="studio-lightbox__panel"
            tabIndex={-1}
            ref={panelRef}
          >
            <img
              className="studio-lightbox__image"
              src={images[active][0]}
              alt={images[active][1]}
            />
          </div>
        </div>
      )}
    </>
  );
}
