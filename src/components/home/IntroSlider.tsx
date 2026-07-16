"use client";

import Link from "next/link";
import { assetPath } from "@/lib/assets";
import { Carousel } from "@/components/ui/Carousel";
import type { HomeIntroSlide } from "@/lib/cms/types";

export function IntroSlider({ slides }: { slides: readonly HomeIntroSlide[] }) {
  const visibleSlides = [...slides]
    .filter((slide) => slide.isVisible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!visibleSlides.length) return null;

  return (
    <section
      id="intro"
      className="home-intro-slider section"
    >
      <Carousel
        items={visibleSlides}
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
