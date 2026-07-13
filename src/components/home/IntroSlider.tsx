"use client";

import Link from "next/link";
import { assetPath } from "@/lib/assets";
import { Carousel } from "@/components/ui/Carousel";
import type { HomeIntroSlide } from "@/lib/cms/types";

const defaultSlides: HomeIntroSlide[] = [
  {
    id: "intro-1",
    text: "Un espacio para tocar la arcilla, aprender con calma y crear piezas con una mirada propia.",
    buttonText: "Reserva una experiencia",
    buttonHref: "/clases",
    image: "img/1766778567125-t8t5rt.png",
    imageAlt:
      "Composicion visual de piezas ceramicas y retrato en Casa Rosier",
    isVisible: true,
    sortOrder: 0
  },
  {
    id: "intro-2",
    text: "Ceramica, materia y tiempo para crear con las manos en Barcelona.",
    buttonText: "Ver clases",
    buttonHref: "/clases",
    image: "img/c0c8f2c3-1d13-4632-9fe8-1ad322e51abd.png",
    imageAlt: "Retrato editorial junto a piezas ceramicas claras",
    isVisible: true,
    sortOrder: 1
  },
  {
    id: "intro-3",
    text: "Clases y workshops para explorar la ceramica desde la practica y el proceso.",
    buttonText: "Ver workshops",
    buttonHref: "/workshops",
    image: "img/0429e735-6642-4339-8e1b-72bdade5c8ad.png",
    imageAlt:
      "Piezas ceramicas esmaltadas en rojo y azul sobre pedestales",
    isVisible: true,
    sortOrder: 2
  },
  {
    id: "intro-4",
    text: "Un taller para probar, equivocarse, volver a empezar y descubrir nuevas formas.",
    buttonText: "Conoce el estudio",
    buttonHref: "/el-estudio",
    image: "img/5fd27c84-15dd-43ef-b039-2e8458a3f1a6.png",
    imageAlt: "Coleccion de cuencos y piezas ceramicas en tonos claros",
    isVisible: true,
    sortOrder: 3
  }
];

export function IntroSlider({ slides = defaultSlides }: { slides?: HomeIntroSlide[] }) {
  const visibleSlides = slides
    .filter((slide) => slide.isVisible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      id="intro"
      className="home-intro-slider section"
    >
      <Carousel
        items={visibleSlides.length ? visibleSlides : defaultSlides}
        ariaLabel="Introduccion visual Casa Rosier"
        className="container home-intro-slider__inner"
        viewportClassName="home-intro-slider__viewport"
        trackClassName="home-intro-slider__slides"
        slideClassName="home-intro-slider__slide"
        dotsClassName="home-intro-slider__dots"
        dotClassName="home-intro-slider__dot"
        showDots
        autoPlayMs={4000}
        getSlideId={(slide) => slide.id}
        renderItem={(slide) => (
          <>
            <div className="intro-slider-image">
              <img
                src={assetPath(slide.image)}
                alt={slide.imageAlt}
                loading="lazy"
                decoding="async"
                className={
                  assetPath(slide.image) !== `/${slide.image}`
                    ? "asset-fallback"
                    : undefined
                }
              />
            </div>
            <div className="intro-slider-content">
              <div className="intro-slider-content__inner">
                <p className="intro-slider-content__text">{slide.text}</p>
                <Link
                  className="intro-slider-content__button"
                  href={slide.buttonHref}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </>
        )}
      />
    </section>
  );
}
