import Link from "next/link";
import { MarkdownContent, renderInlineMarkdown } from "@/components/ui/MarkdownContent";
import type { BlogContentBlock, BlogPost } from "@/data/types";
import { assetPath, internalHref } from "@/lib/assets";

export function BlogDetail({
  post,
  adjacent,
  relatedPosts,
}: {
  post: BlogPost;
  adjacent: { previous: BlogPost | null; next: BlogPost | null };
  relatedPosts: BlogPost[];
}) {
  return (
    <>
      <section className="blog-post section">
        <div className="container article-wrapper blog-post__container">
          <div className="article-header blog-post__header">
            <h1 className="article-title blog-post__article-title">
              {post.title}
            </h1>
            <div className="article-intro blog-post__intro">
              <MarkdownContent className="blog-post__excerpt" source={post.excerpt} />
            </div>
          </div>
          <figure className="blog-post__cover-figure" aria-label={post.title}>
            <img src={assetPath(post.coverImage)} alt={post.title} />
          </figure>
          <article className="article-content blog-post__content">
            {post.contentBlocks.map((block, index) => (
              <ContentBlock block={block} key={`${block.type}-${index}`} />
            ))}
          </article>
        </div>
      </section>
      <section className="blog-post-cta section">
        <div className="container blog-post-cta__container">
          <p>Te apetece probar la ceramica en el taller?</p>
          <Link className="blog-post__button" href="/clases">
            Ver clases
          </Link>
        </div>
      </section>
      <section className="blog-post-nav blog-post-nav--article">
        <div className="container blog-post-nav__container">
          <Link href="/blog">Volver al blog</Link>
          {adjacent.previous && (
            <Link href={`/blog/${adjacent.previous.slug}`}>
              Articulo anterior
            </Link>
          )}
          {adjacent.next && (
            <Link href={`/blog/${adjacent.next.slug}`}>
              Articulo siguiente
            </Link>
          )}
        </div>
      </section>
      {relatedPosts.length > 0 && (
        <section className="blog-related section">
          <div className="container blog-related__container">
            <h2>Tambien puede interesarte</h2>
            <div className="blog-related__grid">
              {relatedPosts.map((item) => (
                <article className="blog-related__card" key={item.id}>
                  <Link
                    className="blog-related__media"
                    href={`/blog/${item.slug}`}
                  >
                    <img
                      src={assetPath(item.coverImage)}
                      alt={item.title}
                    />
                  </Link>
                  <p className="blog-related__category">{item.category}</p>
                  <h3>
                    <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ContentBlock({ block }: { block: BlogContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <MarkdownContent source={block.content} />;
    case "heading":
      return block.level === 3 ? (
        <h3>{renderInlineMarkdown(block.content)}</h3>
      ) : (
        <h2>{renderInlineMarkdown(block.content)}</h2>
      );
    case "quote":
      return (
        <blockquote className="blog-post__quote">
          <p>{renderInlineMarkdown(block.content)}</p>
        </blockquote>
      );
    case "image":
      return (
        <figure className="blog-post__figure">
          <img src={assetPath(block.src)} alt={block.alt ?? ""} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    case "gallery":
      return (
        <div className="blog-post__gallery">
          {block.images.map((image) => (
            <figure className="blog-post__gallery-item" key={image.src}>
              <img src={assetPath(image.src)} alt={image.alt ?? ""} />
            </figure>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="blog-post__inline-cta">
          <Link
            href={internalHref(block.href)}
            className="blog-post__button"
          >
            {block.text}
          </Link>
        </div>
      );
  }
}
