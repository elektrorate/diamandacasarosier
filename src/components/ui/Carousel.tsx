"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/utils";

interface CarouselRenderMeta {
  index: number;
  realIndex: number;
  isDuplicate: boolean;
  isActive: boolean;
}

interface CarouselProps<T> {
  items: readonly T[];
  renderItem: (item: T, meta: CarouselRenderMeta) => ReactNode;
  getSlideProps?: (
    item: T,
    meta: CarouselRenderMeta
  ) => HTMLAttributes<HTMLDivElement>;
  ariaLabel: string;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
  slideClassName?: string;
  dotsClassName?: string;
  dotClassName?: string;
  arrowClassName?: string;
  previousArrowClassName?: string;
  nextArrowClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  marquee?: boolean;
  autoPlayMs?: number;
  previousLabel?: string;
  nextLabel?: string;
  dotLabel?: (index: number) => string;
  getSlideId?: (item: T, index: number) => string;
  onIndexChange?: (index: number) => void;
}

export function Carousel<T>({
  items,
  renderItem,
  getSlideProps,
  ariaLabel,
  className,
  viewportClassName,
  trackClassName,
  slideClassName,
  dotsClassName,
  dotClassName,
  arrowClassName,
  previousArrowClassName,
  nextArrowClassName,
  showDots = false,
  showArrows = false,
  marquee = false,
  autoPlayMs,
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
  dotLabel = (index) => `Ir al slide ${index + 1}`,
  getSlideId,
  onIndexChange
}: CarouselProps<T>) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const canNavigate = items.length > 1;
  const renderedItems = useMemo(
    () => (marquee ? [...items, ...items] : [...items]),
    [items, marquee]
  );

  const goTo = useCallback((nextIndex: number) => {
    if (!items.length) return;
    const normalized = (nextIndex + items.length) % items.length;
    setIndex(normalized);
    onIndexChange?.(normalized);
  }, [items.length, onIndexChange]);

  useEffect(() => {
    if (
      marquee ||
      paused ||
      !autoPlayMs ||
      !canNavigate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      goTo(index + 1);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoPlayMs, canNavigate, goTo, index, marquee, paused]);

  if (!items.length) return null;

  return (
    <div
      className={classNames("carousel", marquee && "carousel--marquee", className)}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (!canNavigate || marquee) return;
        if (event.key === "ArrowLeft") goTo(index - 1);
        if (event.key === "ArrowRight") goTo(index + 1);
      }}
    >
      {showArrows && canNavigate && (
        <button
          className={classNames(
            "carousel__arrow carousel__arrow--prev",
            arrowClassName,
            previousArrowClassName
          )}
          type="button"
          aria-label={previousLabel}
          onClick={() => goTo(index - 1)}
        >
          <span aria-hidden="true">&lt;</span>
        </button>
      )}
      <div className={classNames("carousel__viewport", viewportClassName)}>
        <div
          className={classNames("carousel__track", trackClassName)}
          style={marquee ? undefined : { transform: `translateX(-${index * 100}%)` }}
        >
          {renderedItems.map((item, itemIndex) => {
            const realIndex = itemIndex % items.length;
            const isDuplicate = itemIndex >= items.length;
            const slideId = getSlideId?.(item, realIndex);

            const meta = {
              index: itemIndex,
              realIndex,
              isDuplicate,
              isActive: realIndex === index
            };
            const slideProps = getSlideProps?.(item, meta) ?? {};

            return (
              <div
                {...slideProps}
                className={classNames("carousel__slide", slideClassName)}
                id={!isDuplicate ? slideId : undefined}
                aria-hidden={isDuplicate || undefined}
                key={`${slideId ?? realIndex}-${itemIndex}`}
              >
                {renderItem(item, meta)}
              </div>
            );
          })}
        </div>
      </div>
      {showArrows && canNavigate && (
        <button
          className={classNames(
            "carousel__arrow carousel__arrow--next",
            arrowClassName,
            nextArrowClassName
          )}
          type="button"
          aria-label={nextLabel}
          onClick={() => goTo(index + 1)}
        >
          <span aria-hidden="true">&gt;</span>
        </button>
      )}
      {showDots && canNavigate && (
        <div className={classNames("carousel__dots", dotsClassName)}>
          {items.map((item, dotIndex) => (
            <button
              className={classNames(
                "carousel__dot",
                dotClassName,
                dotIndex === index && "is-active"
              )}
              type="button"
              aria-label={dotLabel(dotIndex)}
              aria-controls={getSlideId?.(item, dotIndex)}
              aria-pressed={dotIndex === index}
              onClick={() => goTo(dotIndex)}
              key={getSlideId?.(item, dotIndex) ?? dotIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ThumbnailGalleryProps<T> {
  items: readonly T[];
  renderMain: (item: T, index: number) => ReactNode;
  renderThumb: (
    item: T,
    index: number,
    isActive: boolean,
    select: () => void
  ) => ReactNode;
  ariaLabel: string;
  className?: string;
  mainClassName?: string;
  thumbsClassName?: string;
}

export function ThumbnailGallery<T>({
  items,
  renderMain,
  renderThumb,
  ariaLabel,
  className,
  mainClassName,
  thumbsClassName
}: ThumbnailGalleryProps<T>) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  if (!current) return null;

  return (
    <div className={classNames("thumbnail-carousel", className)} aria-label={ariaLabel}>
      <div className={classNames("thumbnail-carousel__main", mainClassName)}>
        {renderMain(current, active)}
      </div>
      <div className={classNames("thumbnail-carousel__thumbs", thumbsClassName)}>
        {items.map((item, index) => (
          <div className="thumbnail-carousel__thumb-wrap" key={index}>
            {renderThumb(item, index, active === index, () => setActive(index))}
          </div>
        ))}
      </div>
    </div>
  );
}
