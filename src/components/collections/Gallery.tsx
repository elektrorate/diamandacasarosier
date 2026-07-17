"use client";

import { assetPath } from "@/lib/assets";
import { classNames } from "@/lib/utils";
import { ThumbnailGallery } from "@/components/ui/Carousel";

export function Gallery({
  images,
  title,
  videoImage,
  videoLabel,
  ctaHref,
  showVideo = true
}: {
  images: string[];
  title: string;
  videoImage?: string;
  videoLabel: string;
  ctaHref?: string;
  showVideo?: boolean;
}) {
  return (
    <div className="class-gallery">
      <ThumbnailGallery
        items={images}
        ariaLabel={`Galeria de ${title}`}
        thumbsClassName="class-gallery__thumbs"
        renderMain={(image) => (
          <img
            className="class-gallery__main"
            src={assetPath(image)}
            alt={title}
          />
        )}
        renderThumb={(image, index, isActive, select) => (
          <button
            className={classNames(
              "class-gallery__thumb",
              isActive && "is-active"
            )}
            type="button"
            aria-label={`Ver imagen ${index + 1} de ${title}`}
            onClick={select}
          >
            <img src={assetPath(image)} alt={`${title} ${index + 1}`} />
          </button>
        )}
      />
      {showVideo && (videoImage || ctaHref) ? (
        ctaHref ? (
          <a className="class-gallery__video-card" href={ctaHref} target="_blank" rel="noopener noreferrer">
            {videoImage ? <img src={assetPath(videoImage)} alt={title} /> : null}
            <span>{videoLabel || "VIDEO"}</span>
          </a>
        ) : (
          <div className="class-gallery__video-card">
            {videoImage ? <img src={assetPath(videoImage)} alt={title} /> : null}
            <span>{videoLabel || "IMAGEN"}</span>
          </div>
        )
      ) : null}
    </div>
  );
}
