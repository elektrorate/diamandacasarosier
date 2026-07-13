"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { BlogPost } from "@/data/types";
import { assetPath } from "@/lib/assets";
import { formatDate } from "@/lib/utils";
import { Carousel } from "@/components/ui/Carousel";

export function FeaturedCarousel({ posts }: { posts: readonly BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <Carousel
      items={posts}
      ariaLabel="Articulos destacados del blog"
      className="featured-carousel"
      viewportClassName="featured-carousel__viewport"
      trackClassName="featured-carousel__track"
      slideClassName="featured-slide"
      arrowClassName="featured-carousel__arrow"
      previousArrowClassName="featured-carousel__arrow--prev"
      nextArrowClassName="featured-carousel__arrow--next"
      dotsClassName="featured-carousel__dots"
      dotClassName="featured-carousel__dot"
      showArrows
      showDots
      autoPlayMs={6000}
      previousLabel="Articulo destacado anterior"
      nextLabel="Articulo destacado siguiente"
      dotLabel={(index) => `Ir al destacado ${index + 1}`}
      getSlideId={(post) => `blog-featured-${post.id}`}
      renderItem={(post) => (
        <>
          <div className="featured-slide__peek featured-slide__peek--media">
            <img
              src={assetPath(post.featuredImage ?? post.coverImage)}
              alt={post.title}
            />
          </div>
          <Link className="featured-slide__main" href={`/blog/${post.slug}`}>
            <img
              className="featured-slide__main-image"
              src={assetPath(post.featuredImage ?? post.coverImage)}
              alt={post.title}
            />
            <span className="featured-slide__main-overlay">
              <span className="featured-slide__main-title">{post.title}</span>
            </span>
          </Link>
          <article className="featured-slide__peek featured-slide__peek--content">
            <p className="featured-slide__category">{post.category}</p>
            <h3>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <MarkdownContent className="featured-slide__excerpt" source={post.featuredExcerpt ?? post.excerpt} />
            <div className="featured-slide__meta">
              <span className="featured-slide__author-initial">
                {post.authorInitial || post.author.charAt(0)}
              </span>
              <div>
                <strong>{post.author}</strong>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </article>
        </>
      )}
    />
  );
}
