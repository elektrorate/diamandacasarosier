import Image from "next/image";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { FeaturedCarousel } from "@/components/blog/FeaturedCarousel";
import { HeaderInterno } from "@/components/layout/HeaderInterno";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { IdeaPromptSection } from "@/features/shared/contextual-sections/IdeaPromptSection";
import { SitePage } from "@/features/shared/layout/SitePage";
import { getBlogPageSettings } from "@/lib/cms/blog-page";
import { getPublicBlogData } from "@/lib/cms/blog-public";
import type { CmsHeroSettings } from "@/lib/cms/types";

function BlogHeroContent({ hero }: { hero: CmsHeroSettings }) {
  const variant = hero.heroVariant ?? "text";

  if (variant === "presentation") {
    return (
      <div className="page-hero__presentation">
        <div className="page-hero__presentation-text" style={{ color: hero.heroPresentationTextColor || "#FFFFFF" }}>
          <MarkdownContent source={hero.heroPresentationText || hero.heroTitle || "Bitacora ceramica"} className="page-hero__presentation-copy" />
        </div>
        {hero.heroPresentationImage ? (
          <div className="page-hero__presentation-image">
            <Image src={hero.heroPresentationImage} alt={hero.heroTitle || "Bitacora ceramica"} fill sizes="420px" className="object-contain" unoptimized />
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "image") {
    return (
      <div className="page-hero__script-stack">
        {hero.titleImage ? (
          <Image src={hero.titleImage} alt={hero.heroTitle || "Bitacora ceramica"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--back" unoptimized />
        ) : null}
        {hero.titleImageSecondary ? (
          <Image src={hero.titleImageSecondary} alt={hero.heroTitle || "Bitacora ceramica"} fill sizes="520px" className="page-hero__script-image page-hero__script-image--front" unoptimized />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-hero__title">{hero.heroTitle || "Bitacora ceramica"}</h1>
      {hero.heroSubtitle ? <p className="page-hero__eyebrow">{hero.heroSubtitle}</p> : null}
    </div>
  );
}

export async function BlogIndexPage() {
  const [page, blogData] = await Promise.all([
    getBlogPageSettings(),
    getPublicBlogData(),
  ]);
  const { categories, featured, published } = blogData;
  const hero = page.hero;
  const heroVariant = hero.heroVariant ?? "text";

  return (
    <SitePage
      bodyClass="blog-page"
      header={(
        <HeaderInterno
          className="blog-hero"
          image={hero.heroImage || "/img/hero-bg.jpg"}
          variant={heroVariant}
          hero={hero}
          height="large"
          overlayTitle
          heroMenuTone={hero.heroMenuTone}
          heroMenuColor={hero.heroMenuColor}
          heroMenuScale={hero.heroMenuScale}
          heroLogoPositionX={hero.heroLogoPositionX}
          heroLogoPositionY={hero.heroLogoPositionY}
          heroLogoWidth={hero.heroLogoWidth}
          heroLogoTabletPositionX={hero.heroLogoTabletPositionX}
          heroLogoTabletPositionY={hero.heroLogoTabletPositionY}
          heroLogoTabletWidth={hero.heroLogoTabletWidth}
          heroLogoMobilePositionX={hero.heroLogoMobilePositionX}
          heroLogoMobilePositionY={hero.heroLogoMobilePositionY}
          heroLogoMobileWidth={hero.heroLogoMobileWidth}
          heroMenuPositionY={hero.heroMenuPositionY}
          heroMenuTabletPositionY={hero.heroMenuTabletPositionY}
          heroMenuMobilePositionY={hero.heroMenuMobilePositionY}
          heroTitleImageScale={hero.titleImageScale}
          heroTitleImageScaleTablet={hero.titleImageScaleTablet}
          heroTitleImageScaleMobile={hero.titleImageScaleMobile}
          heroTitleImagePositionX={hero.titleImagePositionX}
          heroTitleImagePositionY={hero.titleImagePositionY}
          heroTitleImagePositionXTablet={hero.titleImagePositionXTablet}
          heroTitleImagePositionYTablet={hero.titleImagePositionYTablet}
          heroTitleImagePositionXMobile={hero.titleImagePositionXMobile}
          heroTitleImagePositionYMobile={hero.titleImagePositionYMobile}
          heroTitleImageSecondaryScale={hero.titleImageSecondaryScale}
          heroTitleImageSecondaryScaleTablet={hero.titleImageSecondaryScaleTablet}
          heroTitleImageSecondaryScaleMobile={hero.titleImageSecondaryScaleMobile}
          heroTitleImageSecondaryPositionX={hero.titleImageSecondaryPositionX}
          heroTitleImageSecondaryPositionY={hero.titleImageSecondaryPositionY}
          heroTitleImageSecondaryPositionXTablet={hero.titleImageSecondaryPositionXTablet}
          heroTitleImageSecondaryPositionYTablet={hero.titleImageSecondaryPositionYTablet}
          heroTitleImageSecondaryPositionXMobile={hero.titleImageSecondaryPositionXMobile}
          heroTitleImageSecondaryPositionYMobile={hero.titleImageSecondaryPositionYMobile}
          heroTitlePositionY={hero.heroTitlePositionY}
          heroTitlePositionYTablet={hero.heroTitlePositionYTablet}
          heroTitlePositionYMobile={hero.heroTitlePositionYMobile}
          heroTitleScale={hero.heroTitleScale}
          heroTitleScaleTablet={hero.heroTitleScaleTablet}
          heroTitleScaleMobile={hero.heroTitleScaleMobile}
          presentationTextPositionX={hero.presentationTextPositionX}
          presentationTextPositionY={hero.presentationTextPositionY}
          presentationTextPositionXTablet={hero.presentationTextPositionXTablet}
          presentationTextPositionYTablet={hero.presentationTextPositionYTablet}
          presentationTextPositionXMobile={hero.presentationTextPositionXMobile}
          presentationTextPositionYMobile={hero.presentationTextPositionYMobile}
          presentationTextScale={hero.presentationTextScale}
          presentationTextScaleTablet={hero.presentationTextScaleTablet}
          presentationTextScaleMobile={hero.presentationTextScaleMobile}
          presentationImagePositionX={hero.presentationImagePositionX}
          presentationImagePositionY={hero.presentationImagePositionY}
          presentationImagePositionXTablet={hero.presentationImagePositionXTablet}
          presentationImagePositionYTablet={hero.presentationImagePositionYTablet}
          presentationImagePositionXMobile={hero.presentationImagePositionXMobile}
          presentationImagePositionYMobile={hero.presentationImagePositionYMobile}
          presentationImageScale={hero.presentationImageScale}
          presentationImageScaleTablet={hero.presentationImageScaleTablet}
          presentationImageScaleMobile={hero.presentationImageScaleMobile}
        />
      )}
    >
      <section className="blog-intro section">
        <div className="container blog-intro__container">
          <p>
            Un espacio para compartir procesos, tecnicas, reflexiones y
            pequenas historias alrededor de la ceramica contemporanea, el taller
            y la creacion con las manos.
          </p>
        </div>
      </section>
      <section className="blog-featured section">
        <div className="container blog-featured__container">
          <h2 className="blog-featured__title">Destacados</h2>
          <FeaturedCarousel posts={featured} />
        </div>
      </section>
      <section className="blog-listing section">
        <div className="container blog-listing__container">
          <BlogGrid posts={published} categories={categories} />
        </div>
      </section>
      {page.showIdeaPromptSection ? <IdeaPromptSection context="blog" /> : null}
    </SitePage>
  );
}
